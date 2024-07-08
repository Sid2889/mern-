javascript
import React from 'react';
import { Bar } from 'react-chartjs-2';

const TransactionsBarChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.range),
    datasets: [
      {
        label: 'Number of Items',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <h2>Bar Chart</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default TransactionsBarChart;
