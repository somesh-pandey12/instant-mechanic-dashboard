import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [metrics, setMetrics] = useState({});
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/dashboard`).then(res => setMetrics(res.data.metrics));
    axios.get(`${BACKEND_URL}/api/bookings`).then(res => setBookings(res.data));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Instant Mechanic Operations</h1>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">Total Bookings: {metrics.totalBookings || 0}</div>
        <div className="bg-white p-4 rounded shadow">Completed: {metrics.completed || 0}</div>
        <div className="bg-white p-4 rounded shadow">Pending: {metrics.pending || 0}</div>
        <div className="bg-white p-4 rounded shadow">Revenue: ₹{metrics.revenue || 0}</div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4">Live Bookings</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Customer</th>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Service</th>
              <th className="p-2">Status</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} className="border-b">
                <td className="p-2">{b.customerName}</td>
                <td className="p-2">{b.vehicle}</td>
                <td className="p-2">{b.service}</td>
                <td className="p-2">{b.status}</td>
                <td className="p-2">₹{b.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;