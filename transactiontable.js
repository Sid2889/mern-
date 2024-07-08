javascript
import React, { useState } from 'react';

const TransactionsTable = ({ transactions, fetchTransactions }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchTransactions(e.target.value, page, perPage);
  };

  const handleNextPage = () => {
    setPage(page + 1);
    fetchTransactions(search, page + 1, perPage);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      fetchTransactions(search, page - 1, perPage);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search transactions" 
        value={search} 
        onChange={handleSearch} 
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date of Sale</th>
            <th>Sold</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.date_of_sale}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
              <td>{transaction.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handlePrevPage}>Previous</button>
      <button onClick={handleNextPage}>Next</button>
    </div>
  );
};

export default TransactionsTable;
