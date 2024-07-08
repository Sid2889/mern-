javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionsTable from './components/TransactionsTable';
import TransactionsStatistics from './components/TransactionsStatistics';
import TransactionsBarChart from './components/TransactionsBarChart';

const App = () => {
  const [month, setMonth] = useState('March');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, [month]);

  const fetchTransactions = async (search = '', page = 1, per_page = 10) => {
    const response = await axios.get('/transactions', {
      params: { month, search, page, per_page }
    });
    setTransactions(response.data);
  };

  const fetchStatistics = async () => {
    const response = await axios.get('/statistics', { params: { month } });
    setStats(response.data);
  };

  const fetchBarChartData = async () => {
    const response = await axios.get('/barchart', { params: { month } });
    setBarChartData(response.data);
  };

  return (
    <div>
      <h1>Transactions Dashboard</h1>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <TransactionsTable transactions={transactions} fetchTransactions={fetchTransactions} />
      <TransactionsStatistics stats={stats} />
      <TransactionsBarChart data={barChartData} />
    </div>
  );
};

export default App;


