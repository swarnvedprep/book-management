const Order = require("../models/Order");
const Book = require("../models/Book");
const Stock = require("../models/Stock");

// @desc    Get stock report
// @route   GET /api/reports/stock
// @access  Private/OperationsManager
const getStockReport = async (req, res) => {
  try {
    const stockReport = await Stock.find()
      .populate("book", "sku examName courseName subject")
      .sort({ "book.examName": 1, "book.courseName": 1 });

    res.json(stockReport);
  } catch (error) {
    console.error("Get stock report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get financial report
// @route   GET /api/reports/financial
// @access  Private/OperationsManager
const getFinancialReport = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("books.book", "printingPrice sellPrice")
      .select("books courier.charges createdAt");

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalPrintingCost = 0;
    let totalCourierCharges = 0;
    let totalProfit = 0;

    orders.forEach((order) => {
      order.books.forEach((item) => {
        const book = item.book;
        totalRevenue += book.sellPrice * item.quantity;
        totalPrintingCost += book.printingPrice * item.quantity;
      });
      totalCourierCharges += order.courier.charges;
    });

    totalProfit = totalRevenue - totalPrintingCost - totalCourierCharges;

    res.json({
      totalOrders,
      totalRevenue,
      totalPrintingCost,
      totalCourierCharges,
      totalProfit,
      orders: orders.map((order) => ({
        _id: order._id,
        createdAt: order.createdAt,
        revenue: order.books.reduce(
          (sum, item) => sum + item.book.sellPrice * item.quantity,
          0
        ),
        printingCost: order.books.reduce(
          (sum, item) => sum + item.book.printingPrice * item.quantity,
          0
        ),
        courierCharges: order.courier.charges,
        profit:
          order.books.reduce(
            (sum, item) =>
              sum +
              (item.book.sellPrice - item.book.printingPrice) * item.quantity,
            0
          ) - order.courier.charges,
      })),
    });
  } catch (error) {
    console.error("Get financial report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get order status report
// @route   GET /api/reports/order-status
// @access  Private/OperationsManager
const getOrderStatusReport = async (req, res) => {
  try {
    const orders = await Order.find();

    const statusReport = {
      printing: {
        Pending: 0,
        "In Progress": 0,
        Done: 0,
      },
      dispatch: {
        Pending: 0,
        Dispatched: 0,
        Delivered: 0,
      },
    };

    orders.forEach((order) => {
      statusReport.printing[order.status.printing]++;
      statusReport.dispatch[order.status.dispatch]++;
    });
    const orderData = orders.map((item) => ({
      userName: item.user.name,
      userPhone: item.user.phoneNumber,
      userEmail: item.user.email,
    }));
    res.json({ statusReport: statusReport, orderData });
  } catch (error) {
    console.error("Get order status report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete stock controller
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    await stock.remove();

    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const incrementStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementBy } = req.body; // Number to increment

    if (typeof incrementBy !== 'number' || incrementBy <= 0) {
      return res.status(400).json({ message: 'Increment value must be a positive number.' });
    }

    const stock = await Stock.findById(id).populate('book');
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    stock.currentStock += incrementBy;
    stock.totalStock += incrementBy; // (Optional: update totalStock as well)

    await stock.save();

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  incrementStock,
  deleteStock,
  getStockReport,
  getFinancialReport,
  getOrderStatusReport,
};
