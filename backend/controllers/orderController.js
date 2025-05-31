const Order = require('../models/Order');
const Book = require('../models/Book');
const Stock = require('../models/Stock');
const { sendSMS } = require('../config/sms');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Executive/Councellor
const createOrder = async (req, res) => {
  const {
    user,
    books,
    bundles,
    transactionId,
    courier
  } = req.body;

  try {
    // Validate if books are available in stock
    for (const item of books) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(400).json({ message: `Book with ID ${item.book} not found` });
      }

      const stock = await Stock.findOne({ book: item.book });
      if (!stock || stock.currentStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for book ${book.sku}. Available: ${stock ? stock.currentStock : 0}, Requested: ${item.quantity}` 
        });
      }
    }

    // Create the order with bundles information if provided
    const order = await Order.create({
      user,
      books,
      bundles: bundles && bundles.length > 0 ? bundles : [],
      transactionId,
      courier,
      createdBy: req.user._id
    });

    // Update stock for each book
    for (const item of books) {
      await Stock.findOneAndUpdate(
        { book: item.book },
        {
          $inc: {
            orderedStock: item.quantity,
            currentStock: -item.quantity
          }
        }
      );
    }

    // Send confirmation SMS to customer
    const message = `Dear ${user.name}, your order has been placed successfully. Transaction ID: ${transactionId}. We'll notify you once your books are ready.`;
    await sendSMS(user.phoneNumber, message);

    res.status(201).json({
      success: true,
      order,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders with pagination, search, sort, and filters
// @route   GET /api/orders
// @access  Private
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isCompleted,
      printingStatus,
      dispatchStatus
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build match conditions
    const matchConditions = {};

    // Search functionality - search in user name, phone, email, and order ID
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchConditions.$or = [
        { 'user.name': searchRegex },
        { 'user.phoneNumber': searchRegex },
        { 'user.email': searchRegex },
        { transactionId: searchRegex }
      ];
    }

    // Filter by completion status
    if (isCompleted !== undefined && isCompleted !== '') {
      matchConditions.isCompleted = isCompleted === 'true';
    }

    // Filter by printing status
    if (printingStatus && printingStatus !== '') {
      matchConditions['status.printing'] = printingStatus;
    }

    // Filter by dispatch status
    if (dispatchStatus && dispatchStatus !== '') {
      matchConditions['status.dispatch'] = dispatchStatus;
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['createdAt', 'updatedAt', 'user.name', 'status.printing', 'status.dispatch'];
    
    if (validSortFields.includes(sortBy)) {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1; // Default sort
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(matchConditions);

    // Get orders with pagination
    const orders = await Order.find(matchConditions)
      .populate('books.book', 'sku examName courseName subject')
      .populate('bundles', 'name description price')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Response with pagination metadata
    const response = {
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      },
      filters: {
        search,
        sortBy,
        sortOrder,
        isCompleted,
        printingStatus,
        dispatchStatus
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    
    const order = await Order.findById(req.params.id)
      .populate('books.book', 'sku examName courseName subject printingPrice sellPrice')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update printing status
// @route   PUT /api/orders/:id/printing
// @access  Private/Executive/Councellor
const updatePrintingStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status.printing = status;
    order.updatedBy = req.user._id;

    const updatedOrder = await order.save();

    if (status === 'Done') {
      const message = `Dear ${order.user.name}, your books have been printed and will be dispatched soon. Order ID: ${order._id}.`;
      await sendSMS(order.user.phoneNumber, message);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update printing status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update dispatch status
// @route   PUT /api/orders/:id/dispatch
// @access  Private/Executive/Councellor
const updateDispatchStatus = async (req, res) => {
  const { status:dispatchStatus, trackingId } = req.body;
console.log(dispatchStatus);

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status.dispatch = dispatchStatus;
    if (trackingId) {
      order.courier.trackingId = trackingId;
    }
    order.updatedBy = req.user._id;

    const updatedOrder = await order.save();

    if (dispatchStatus === 'Dispatched') {
      const message = `Dear ${order.user.name}, your order has been dispatched. Tracking ID: ${trackingId || 'N/A'}. Courier: ${order.courier.type}.`;
      await sendSMS(order.user.phoneNumber, message);
    } else if (dispatchStatus === 'Delivered') {
      const message = `Dear ${order.user.name}, your order has been delivered. We hope you're satisfied with our service.`;
      await sendSMS(order.user.phoneNumber, message);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update dispatch status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an order
// @route DELETE /api/orders/:id
// @access Private (Admin only)

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    for (const item of order.books) {
      await Stock.findOneAndUpdate(
        { book: item.book },
        {
          $inc: {
            orderedStock: -item.quantity,
            currentStock: item.quantity
          }
        }
      );
    }
    
    await Order.findByIdAndDelete(req.params.id);
    // Send SMS notification to user
    // const message = `Dear ${order.user.name}, your order has been deleted. If you have any questions, please contact us.`;
    // await sendSMS(order.user.phoneNumber, message);
    // Send success response

    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//  Update an existing order
//  @route PUT /api/orders/:id
//  @access Private (Admin/Staff)
 
const updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const {
    user,
    books,
    bundles,
    transactionId,
    courier,
    status,
    isCompleted
  } = req.body;

  try {
    // Get the existing order
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Calculate stock adjustments based on differences between existing and new order
    const stockAdjustments = {};
    
    // Reverse the stock changes from the existing order
    for (const item of existingOrder.books) {
      const bookId = item.book.toString();
      stockAdjustments[bookId] = stockAdjustments[bookId] || {
        orderedStock: 0,
        currentStock: 0
      };
      stockAdjustments[bookId].orderedStock -= item.quantity;
      stockAdjustments[bookId].currentStock += item.quantity;
    }
    
    // Apply the stock changes for the updated order
    for (const item of books) {
      const bookId = item.book;
      stockAdjustments[bookId] = stockAdjustments[bookId] || {
        orderedStock: 0,
        currentStock: 0
      };
      stockAdjustments[bookId].orderedStock += item.quantity;
      stockAdjustments[bookId].currentStock -= item.quantity;
    }
    
    // Validate if books are available in stock after adjustments
    for (const bookId in stockAdjustments) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(400).json({ message: `Book with ID ${bookId} not found` });
      }

      const stock = await Stock.findOne({ book: bookId });
      if (!stock) {
        return res.status(400).json({ message: `Stock not found for book ${book.sku}` });
      }
      
      // Check if the adjustment would result in negative stock
      const resultingStock = stock.currentStock + stockAdjustments[bookId].currentStock;
      if (resultingStock < 0) {
        return res.status(400).json({ 
          message: `Update would result in negative stock for book ${book.sku}. Available: ${stock.currentStock}, After adjustment: ${resultingStock}` 
        });
      }
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        user,
        books,
        bundles: bundles && bundles.length > 0 ? bundles : [],
        transactionId,
        courier,
        status,
        updatedBy: req.user._id,
        isCompleted
      },
      { new: true, runValidators: true }
    );

    // Apply stock adjustments
    for (const bookId in stockAdjustments) {
      const adjustment = stockAdjustments[bookId];
      await Stock.findOneAndUpdate(
        { book: bookId },
        {
          $inc: {
            orderedStock: adjustment.orderedStock,
            currentStock: adjustment.currentStock
          }
        }
      );
    }

    // Send SMS notification if status has changed
    if (existingOrder.status.dispatch !== status.dispatch && status.dispatch === 'Dispatched') {
      const message = `Dear ${user.name}, your order has been dispatched! ${courier.trackingId ? `Tracking ID: ${courier.trackingId}` : ''}`;
      await sendSMS(user.phoneNumber, message);
    } else if (existingOrder.status.dispatch !== status.dispatch && status.dispatch === 'Delivered') {
      const message = `Dear ${user.name}, your order has been marked as delivered. Thank you for your purchase!`;
      await sendSMS(user.phoneNumber, message);
    }

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully"
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updatePrintingStatus,
  updateDispatchStatus,
  deleteOrder,
  updateOrder
};