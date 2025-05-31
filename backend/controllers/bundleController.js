const Bundle = require('../models/Bundle');

const getAllBundles = async (req, res) => {
  try {
    const bundles = await Bundle.find().sort({ createdAt: -1 });
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createBundle = async (req, res) => {
  const { name, description } = req.body;
  try {
    const exists = await Bundle.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Bundle already exists' });
    const bundle = await Bundle.create({ name, description });
    res.status(201).json(bundle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBundle = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const bundle = await Bundle.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.json(bundle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBundle = async (req, res) => {
  const { id } = req.params;
  try {
    const bundle = await Bundle.findByIdAndDelete(id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.json({ message: 'Bundle deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllBundles, createBundle, updateBundle, deleteBundle };
