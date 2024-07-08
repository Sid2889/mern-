const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// Check connection
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schema and model
const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  sold: Boolean,
  category: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Fetch and initialize data endpoint
app.get('/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    await Transaction.deleteMany({}); // Clear existing data

    await Transaction.insertMany(data); // Insert new data

    res.status(200).json({ message: 'Data initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error initializing data' });
  }
});

// Utility function to parse month
const parseMonth = (month) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months.indexOf(month) + 1;
};

// API to list all transactions
app.get('/transactions', async (req, res) => {
  const { page = 1, per_page = 10, search = '' } = req.query;

  try {
    const query = {
      $or: [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { price: new RegExp(search, 'i') }
      ]
    };

    const transactions = await Transaction.find(query)
      .skip((page - 1) * per_page)
      .limit(parseInt(per_page));

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// API for statistics
app.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const month_num = parseMonth(month);

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { sold: true, $expr: { $eq: [{ $month: "$dateOfSale" }, month_num] } } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      sold: true,
      $expr: { $eq: [{ $month: "$dateOfSale" }, month_num] }
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      sold: false,
      $expr: { $eq: [{ $month: "$dateOfSale" }, month_num] }
    });

    res.status(200).json({
      total_sale_amount: totalSaleAmount[0]?.total || 0,
      total_sold_items: totalSoldItems,
      total_not_sold_items: totalNotSoldItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// API for bar chart
app.get('/barchart', async (req, res) => {
  const { month } = req.query;
  const month_num = parseMonth(month);

  const priceRanges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "201-300", min: 201, max: 300 },
    { range: "301-400", min: 301, max: 400 },
    { range: "401-500", min: 401, max: 500 },
    { range: "501-600", min: 501, max: 600 },
    { range: "601-700", min: 601, max: 700 },
    { range: "701-800", min: 701, max: 800 },
    { range: "801-900", min: 801, max: 900 },
    { range: "901-above", min: 901, max: Infinity }
  ];

  try {
    const result = await Promise.all(priceRanges.map(async ({ range, min, max }) => {
      const count = await Transaction.countDocuments({
        $expr: { $eq: [{ $month: "$dateOfSale" }, month_num] },
        price: { $gte: min, $lt: max }
      });
      return { range, count };
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bar chart data' });
  }
});

// API for pie chart
app.get('/piechart', async (req, res) => {
  const { month } = req.query;
  const month_num = parseMonth(month);

  try {
    const categories = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, month_num] } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.status(200).json(categories.map(c => ({ category: c._id, count: c.count })));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pie chart data' });
  }
});

// API to fetch combined data
app.get('/combined', async (req, res) => {
  const { month } = req.query;

  try {
    const transactions = await list_transactions(req, res);
    const stats = await statistics(req, res);
    const bar_chart_data = await bar_chart(req, res);
    const pie_chart_data = await pie_chart(req, res);

    const combined_result = {
      transactions: transactions.json,
      statistics: stats.json,
      bar_chart: bar_chart_data.json,
      pie_chart: pie_chart_data.json
    };

    res.status(200).json(combined_result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching combined data' });
  }
});

app.listen(port, () => {
  console.log(Server running on http://localhost:${port});
});