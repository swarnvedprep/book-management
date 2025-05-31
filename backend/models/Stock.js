const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  totalStock: {
    type: Number,
    required: true,
    default: 0
  },
  orderedStock: {
    type: Number,
    required: true,
    default: 0
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
},{
  timestamps:true
});

module.exports = mongoose.model('Stock', StockSchema);