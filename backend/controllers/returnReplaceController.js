const ReturnReplace = require('../models/ReturnReplace');
const Order = require('../models/Order');
const Book = require('../models/Book');
const Stock = require('../models/Stock');

// @desc    Create return or replacement request
// @route   POST /api/return-replace
// @access  Private (Admin/Staff)
const createReturnReplace = async (req, res) => {
  const { orderId, type, items, adminNotes } = req.body;

  try {
    const order = await Order.findById(orderId).populate('books.book');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order already has active return/replacement
    if (order.hasActiveReturn) {
      return res.status(400).json({ 
        message: 'Order already has an active return/replacement request' 
      });
    }

    // Validate items and calculate financials
    let totalOrderValue = 0;
    let refundAmount = 0;
    let additionalCharges = 0;
    const validatedItems = [];

    for (const item of items) {
      // Find original book in order
      const orderBook = order.books.find(
        book => book.book._id.toString() === item.book.toString()
      );

      if (!orderBook) {
        return res.status(400).json({ 
          message: `Book ${item.book} not found in original order` 
        });
      }

      if (item.affectedQuantity > orderBook.quantity) {
        return res.status(400).json({ 
          message: `Cannot process ${item.affectedQuantity} items. Only ${orderBook.quantity} were ordered.` 
        });
      }

      const bookValue = orderBook.book.sellPrice * item.affectedQuantity;
      totalOrderValue += bookValue;

      if (type === 'Return') {
        refundAmount += bookValue;
      } else if (type === 'Replacement') {
        // Check replacement book exists and calculate price difference
        if (!item.replacementBook) {
          return res.status(400).json({ 
            message: 'Replacement book is required for replacement requests' 
          });
        }

        const replacementBook = await Book.findById(item.replacementBook);
        if (!replacementBook) {
          return res.status(400).json({ 
            message: `Replacement book ${item.replacementBook} not found` 
          });
        }

        const replacementValue = replacementBook.sellPrice * (item.replacementQuantity || item.affectedQuantity);
        const priceDifference = replacementValue - bookValue;
        
        if (priceDifference > 0) {
          additionalCharges += priceDifference;
        } else {
          refundAmount += Math.abs(priceDifference);
        }
      }

      validatedItems.push({
        ...item,
        orderedQuantity: orderBook.quantity
      });
    }

    const finalAmount = type === 'Return' ? -refundAmount : (additionalCharges - refundAmount);

    // Create return/replacement request
    const request = await ReturnReplace.create({
      order: orderId,
      type,
      items: validatedItems,
      financials: {
        totalOrderValue,
        refundAmount,
        additionalCharges,
        finalAmount
      },
      adminNotes,
      createdBy: req.user._id
    });

    await Order.findByIdAndUpdate(orderId, {
      hasActiveReturn: true
    });

    res.status(201).json({
      success: true,
      request,
      message: `${type} request created successfully`
    });

  } catch (error) {
    console.error('Create return/replace error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all return/replacement requests
// @route   GET /api/return-replace
// @access  Private
const getAllRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      search = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const matchConditions = {};
    if (type) matchConditions.type = type;
    if (status) matchConditions.status = status;

    const totalRequests = await ReturnReplace.countDocuments(matchConditions);

    let query = ReturnReplace.find(matchConditions)
      .populate({
        path: 'order',
        select: 'user transactionId createdAt',
        match: search.trim() ? {
          $or: [
            { 'user.name': new RegExp(search.trim(), 'i') },
            { 'user.phoneNumber': new RegExp(search.trim(), 'i') },
            { transactionId: new RegExp(search.trim(), 'i') }
          ]
        } : {}
      })
      .populate('items.book', 'sku examName subject sellPrice')
      .populate('items.replacementBook', 'sku examName subject sellPrice')
      .populate('createdBy', 'name')
      .populate('resolution.processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const requests = await query;
    const filteredRequests = requests.filter(req => req.order);

    res.json({
      requests: filteredRequests,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRequests / limitNum),
        totalRequests,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get request by ID
// @route   GET /api/return-replace/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await ReturnReplace.findById(req.params.id)
      .populate({
        path: 'order',
        populate: {
          path: 'books.book',
          select: 'sku examName subject sellPrice'
        }
      })
      .populate('items.book', 'sku examName subject sellPrice')
      .populate('items.replacementBook', 'sku examName subject sellPrice')
      .populate('createdBy', 'name email')
      .populate('resolution.processedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process return/replacement (Approve/Complete)
// @route   PUT /api/return-replace/:id/process
// @access  Private (Admin/Staff)
const processRequest = async (req, res) => {
  const { action, transactionId, notes } = req.body; 

  try {
    const request = await ReturnReplace.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const order = await Order.findById(request.order);

    if (action === 'approve') {
      request.status = 'Approved';
      
    } else if (action === 'complete') {
      // Process the actual return/replacement
      
      for (const item of request.items) {
        if (request.type === 'Return') {
          // Add returned stock back
          await Stock.findOneAndUpdate(
            { book: item.book },
            {
              $inc: {
                currentStock: item.affectedQuantity,
                orderedStock: -item.affectedQuantity
              }
            }
          );
        } else if (request.type === 'Replacement') {
          // Remove original stock and add replacement stock
          await Stock.findOneAndUpdate(
            { book: item.book },
            {
              $inc: {
                currentStock: item.affectedQuantity,
                orderedStock: -item.affectedQuantity
              }
            }
          );
          
          const replacementStock = await Stock.findOne({ book: item.replacementBook });
          const replacementQty = item.replacementQuantity || item.affectedQuantity;
          
          if (!replacementStock || replacementStock.currentStock < replacementQty) {
            return res.status(400).json({ 
              message: `Insufficient stock for replacement book. Available: ${replacementStock?.currentStock || 0}` 
            });
          }
          
          await Stock.findOneAndUpdate(
            { book: item.replacementBook },
            {
              $inc: {
                currentStock: -replacementQty,
                orderedStock: replacementQty
              }
            }
          );
        }
      }

      // Update order return status
      const isFullReturn = request.items.every(item => 
        item.affectedQuantity === item.orderedQuantity
      );
      
      const orderReturnStatus = isFullReturn ? 'Full' : 'Partial';
      const totalReturnedValue = order.totalReturnedValue + request.financials.totalOrderValue;

      await Order.findByIdAndUpdate(request.order, {
        returnStatus: orderReturnStatus,
        hasActiveReturn: false,
        totalReturnedValue
      });

      request.status = 'Completed';
      request.resolution = {
        processedAt: new Date(),
        processedBy: req.user._id,
        transactionId,
        notes
      };
      
    } else if (action === 'reject') {
      request.status = 'Rejected';
      request.resolution = {
        processedAt: new Date(),
        processedBy: req.user._id,
        notes
      };
      
      // Remove active return flag
      await Order.findByIdAndUpdate(request.order, {
        hasActiveReturn: false
      });
    }

    await request.save();

    res.json({
      success: true,
      request,
      message: `Request ${action}ed successfully`
    });

  } catch (error) {
    console.error('Process request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete return/replacement request
// @route   DELETE /api/return-replace/:id
// @access  Private (Admin)
const deleteRequest = async (req, res) => {
  try {
    const request = await ReturnReplace.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'Completed') {
      return res.status(400).json({ 
        message: 'Cannot delete completed requests' 
      });
    }

    await Order.findByIdAndUpdate(request.order, {
      hasActiveReturn: false
    });

    await ReturnReplace.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Request Deleted Successfully'
    });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/return-replace/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const stats = await ReturnReplace.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          count: { $sum: 1 },
          totalValue: { $sum: '$financials.totalOrderValue' },
          totalRefunds: { $sum: '$financials.refundAmount' }
        }
      }
    ]);

    const totalRequests = await ReturnReplace.countDocuments();
    const activeRequests = await ReturnReplace.countDocuments({ 
      status: { $in: ['Requested', 'Approved', 'Processing'] } 
    });

    res.json({
      totalRequests,
      activeRequests,
      breakdown: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReturnReplace,
  getAllRequests,
  getRequestById,
  processRequest,
  deleteRequest,
  getStats
};
