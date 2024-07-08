javascript
import React from 'react';

const TransactionsStatistics = ({ stats }) => {
  return (
    <div>
      <h2>Statistics</h2>
      <div>Total Sale Amount: ${stats.total_sale_amount}</div>
      <div>Total Sold Items: {stats.total_sold_items}</div>
      <div>Total Not Sold Items: {stats.total_not_sold_items}</div>
    </div>
  );
};

export default TransactionsStatistics;
