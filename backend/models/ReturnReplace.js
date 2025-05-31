const mongoose = require("mongoose");

const ReturnReplaceSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  type: {
    type: String,
    enum: ['Return', 'Replacement'],
    required: true
  },
  items: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    orderedQuantity: { type: Number, required: true }, // Original quantity in order
    affectedQuantity: { type: Number, required: true }, // Quantity being returned/replaced
    reason: {
      type: String,
      required: true,
      enum: ['Damaged', 'Wrong Item', 'Quality Issue', 'Printing Error', 'Customer Request', 'Other']
    },
    // For replacements
    replacementBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    replacementQuantity: { type: Number }
  }],
  financials: {
    totalOrderValue: { type: Number }, // Value of items being processed
    refundAmount: { type: Number, default: 0 }, // For returns
    additionalCharges: { type: Number, default: 0 }, // For replacements if price difference
    finalAmount: { type: Number } // Net amount (refund = negative, additional = positive)
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Processing', 'Completed', 'Rejected'],
    default: 'Requested'
  },
  resolution: {
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionId: { type: String }, // For refund transactions
    notes: { type: String }
  },
  adminNotes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Indexes
ReturnReplaceSchema.index({ order: 1 });
ReturnReplaceSchema.index({ type: 1, status: 1 });
ReturnReplaceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ReturnReplace", ReturnReplaceSchema);