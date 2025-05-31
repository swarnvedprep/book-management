const Book = require('../models/Book');
const Stock = require('../models/Stock');
const Bundle = require('../models/Bundle');

const createBook = async (req, res) => {
  const { sku, examName, courseName, subject, printingPrice, sellPrice, description, stock, bundle } = req.body;

  try {
    const bookExists = await Book.findOne({ sku });
    if (bookExists) return res.status(400).json({ message: 'Book with this SKU already exists' });

    // Ensure bundle exists
    const bundleDoc = await Bundle.findById(bundle);
    if (!bundleDoc) return res.status(400).json({ message: 'Invalid bundle' });

    const book = await Book.create({
      sku, examName, courseName, subject, printingPrice, sellPrice, description, bundle
    });

    await Stock.create({
      book: book._id,
      totalStock: stock,
      orderedStock: 0,
      currentStock: 0
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBook = async (req, res) => {
  const { sku, examName, courseName, subject, printingPrice, sellPrice, description, bundle } = req.body;

  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      book.sku = sku || book.sku;
      book.examName = examName || book.examName;
      book.courseName = courseName || book.courseName;
      book.subject = subject || book.subject;
      book.printingPrice = printingPrice || book.printingPrice;
      book.sellPrice = sellPrice || book.sellPrice;
      book.description = description || book.description;
      if (bundle) {
        const bundleDoc = await Bundle.findById(bundle);
        if (!bundleDoc) return res.status(400).json({ message: 'Invalid bundle' });
        book.bundle = bundle;
      }
      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('bundle').sort({ examName: 1, courseName: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('bundle');
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get book by ID
// @route   DELETE /api/books/:id
// @access  Private
const deleteBookById = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    const stock = await Stock.findOneAndDelete({book:req.params.id})
    if (book && stock) {
      res.status(200).json({message:"Book Deleted succcessfully"})
    } else {
      res.status(404).json({ message: 'Book/stock not found' });
    }
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBooks,
  createBook,
  updateBook,
  getBookById,
  deleteBookById
};