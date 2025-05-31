const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    examName: { type: String, required: true },
    courseName: { type: String, required: true },
    subject: { type: String, required: true },
    printingPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    description: { type: String },
    bundle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", BookSchema);
