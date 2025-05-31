const Order = require('../models/Order');
const Book = require('../models/Book');
const Bundle = require('../models/Bundle');
const Stock = require('../models/Stock');
const { sendSMS } = require('../config/sms');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// @desc    Create orders in bulk from CSV
// @route   POST /api/orders/bulk
// @access  Private/Executive/Councellor
const createBulkOrders = async (req, res) => {
  let processedOrders = [];
  let failedOrders = [];
  let csvFilePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    csvFilePath = req.file.path;
    const orders = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          orders.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty or invalid'
      });
    }

    // Validate and process each order
    for (let i = 0; i < orders.length; i++) {
      const orderData = orders[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        const validationResult = validateOrderData(orderData, rowNumber);
        if (!validationResult.isValid) {
          failedOrders.push({
            row: rowNumber,
            data: orderData,
            error: validationResult.error
          });
          continue;
        }

        // Find bundle and get associated books
        const bundleNames = orderData.bundleNames.split(',').map(name => name.trim());
        const bundles = [];
        const books = [];

        for (const bundleName of bundleNames) {
          const bundle = await Bundle.findOne({ name: bundleName });
          if (!bundle) {
            throw new Error(`Bundle '${bundleName}' not found`);
          }
          bundles.push(bundle._id);

          // Get all books in this bundle
          const bundleBooks = await Book.find({ bundle: bundle._id });
          if (bundleBooks.length === 0) {
            throw new Error(`No books found in bundle '${bundleName}'`);
          }

          // Add books to the order (default quantity = 1)
          bundleBooks.forEach(book => {
            const existingBook = books.find(b => b.book.toString() === book._id.toString());
            if (existingBook) {
              existingBook.quantity += 1;
            } else {
              books.push({
                book: book._id,
                quantity: 1
              });
            }
          });
        }

        // Check stock availability for all books
        for (const item of books) {
          const book = await Book.findById(item.book);
          if (!book) {
            throw new Error(`Book with ID ${item.book} not found`);
          }

          const stock = await Stock.findOne({ book: item.book });
          if (!stock || stock.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for book ${book.sku}. Available: ${stock ? stock.currentStock : 0}, Required: ${item.quantity}`);
          }
        }

        // Create the order
        const newOrder = await Order.create({
          user: {
            name: orderData.name,
            fatherName: orderData.fatherName || '',
            college: orderData.college || '',
            email: orderData.email,
            phoneNumber: orderData.phoneNumber,
            alternateNumber: orderData.alternateNumber || '',
            pinCode: orderData.pinCode,
            address: orderData.address,
            landmark: orderData.landmark || '',
            state: orderData.state,
            city: orderData.city
          },
          books,
          bundles,
          kitType: orderData.kitType || '',
          batchType: orderData.batchType || '',
          orderType: orderData.orderType || '',
          payment: parseFloat(orderData.payment) || 0,
          remainingPayment: parseFloat(orderData.remainingPayment) || 0,
          remark: orderData.remark || '',
          transactionId: orderData.transactionId,
          courier: {
            type: orderData.courierType || '',
            charges: parseFloat(orderData.courierCharges) || 0
          },
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

        // Send SMS notification
        try {
          const message = `Dear ${orderData.name}, your order has been placed successfully. Transaction ID: ${orderData.transactionId}. We'll notify you once your books are ready.`;
          await sendSMS(orderData.phoneNumber, message);
        } catch (smsError) {
          console.error(`SMS failed for order ${newOrder._id}:`, smsError);
          // Don't fail the order creation if SMS fails
        }

        processedOrders.push({
          row: rowNumber,
          orderId: newOrder._id,
          transactionId: orderData.transactionId,
          customerName: orderData.name
        });

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        
        // If we've already processed some orders, we need to rollback
        if (processedOrders.length > 0) {
          await rollbackProcessedOrders(processedOrders);
          throw new Error(`Bulk order creation failed at row ${rowNumber}: ${error.message}. All operations have been rolled back.`);
        }

        failedOrders.push({
          row: rowNumber,
          data: orderData,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    if (csvFilePath) {
      fs.unlinkSync(csvFilePath);
    }

    // Return results
    if (failedOrders.length > 0 && processedOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All orders failed to process',
        failedOrders,
        processedOrders: []
      });
    }

    if (failedOrders.length > 0) {
      return res.status(207).json({
        success: 'partial',
        message: `${processedOrders.length} orders created successfully, ${failedOrders.length} orders failed`,
        processedOrders,
        failedOrders
      });
    }

    res.status(201).json({
      success: true,
      message: `All ${processedOrders.length} orders created successfully`,
      processedOrders,
      failedOrders: []
    });

  } catch (error) {
    console.error('Bulk order creation error:', error);
    
    // Clean up uploaded file
    if (csvFilePath) {
      try {
        fs.unlinkSync(csvFilePath);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error during bulk order creation',
      processedOrders,
      failedOrders
    });
  }
};

// Helper function to validate order data
const validateOrderData = (data, rowNumber) => {
  const requiredFields = [
    'name', 'email', 'phoneNumber', 'pinCode', 
    'address', 'state', 'city', 'transactionId', 'bundleNames'
  ];

  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      return {
        isValid: false,
        error: `Missing required field '${field}' in row ${rowNumber}`
      };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      error: `Invalid email format in row ${rowNumber}`
    };
  }

  // Validate phone number (basic validation)
  if (data.phoneNumber.length < 10) {
    return {
      isValid: false,
      error: `Invalid phone number in row ${rowNumber}`
    };
  }

  return { isValid: true };
};

// Helper function to rollback processed orders
const rollbackProcessedOrders = async (processedOrders) => {
  console.log('Rolling back processed orders...');
  
  for (const orderInfo of processedOrders) {
    try {
      const order = await Order.findById(orderInfo.orderId);
      if (order) {
        // Restore stock
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
        
        // Delete the order
        await Order.findByIdAndDelete(orderInfo.orderId);
      }
    } catch (rollbackError) {
      console.error(`Error rolling back order ${orderInfo.orderId}:`, rollbackError);
    }
  }
};

module.exports = {
  createBulkOrders,
  upload
};