const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    fatherName: { type: String },
    college: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    alternateNumber: { type: String },
    pinCode: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true }
  },
  bundles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle'
  }],
  books: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, default: 1 }
  }],
  kitType: { type: String },
  batchType: { type: String },
  orderType: { type: String },
  payment: { type: Number },
  remainingPayment: { type: Number },
  remark: { type: String },
  transactionId: { type: String, required: true },
  courier: {
    type: { type: String, required: true },
    trackingId: { type: String },
    charges: { type: Number, required: true }
  },
  status: {
    printing: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
    dispatch: { type: String, enum: ['Pending', 'Dispatched', 'Delivered'], default: 'Pending' }
  },
  isCompleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnStatus: {
    type: String,
    enum: ['None', 'Partial', 'Full', 'Processing'],
    default: 'None'
  },
  hasActiveReturn: { type: Boolean, default: false },
  totalReturnedValue: { type: Number, default: 0 }
},{
  timestamps: true
});

module.exports = mongoose.model("Order", OrderSchema);
