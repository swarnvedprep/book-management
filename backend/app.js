const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


dotenv.config();

const app = express();

// const corsOptions = {
//   origin: 'http://localhost:5173', 
//   credentials: true, 
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const sheetDataRoutes = require('./routes/sheetDataRoutes');
const bundleRoutes = require('./routes/bundleRoutes');
const bulkRoutes = require('./routes/bulkRoutes');
const returnReplaceRoutes = require('./routes/returnReplaceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bulk-orders', bulkRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sheet', sheetDataRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/return-replace', returnReplaceRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

module.exports = app;