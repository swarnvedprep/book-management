const mongoose = require("mongoose");

const BundleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bundle", BundleSchema);
