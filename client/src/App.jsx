import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Wrench, CalendarCheck, Clock, CheckCircle2, DollarSign } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [metrics, setMetrics] = useState({ totalBookings: 0, completed: 0, pending: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard`),
        axios.get(`${API_URL}/api/bookings`)
      ]);
      setMetrics(dashRes.data.metrics || {});
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Live Polling every 10 seconds (Assignment Requirement)
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Wrench className="text-amber-400 w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wide">Instant Mechanic | Live Operations</h1>
        </div>
        <span className="flex items-center text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping mr-2"></span>
          Live Sync Active
        </span>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard title="Total Bookings" value={metrics.totalBookings} icon={<CalendarCheck className="text-blue-500" />} />
          <MetricCard title="Completed" value={metrics.completed} icon={<CheckCircle2 className="text-emerald-500" />} />
          <MetricCard title="Pending" value={metrics.pending} icon={<Clock className="text-amber-500" />} />
          <MetricCard title="Total Revenue" value={`₹${metrics.revenue || 0}`} icon={<DollarSign className="text-indigo-500" />} />
        </div>

        {/* Live Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5 text-slate-500" />
              <span>Operations Live Feed</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Service Required</th>
                  <th className="p-4">Assigned Mechanic</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-6 text-slate-400">Loading live operational data...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-6 text-slate-400">No bookings found.</td></tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{b.customerName}</td>
                      <td className="p-4 text-slate-600">{b.vehicle}</td>
                      <td className="p-4 text-slate-600">{b.service}</td>
                      <td className="p-4 text-slate-600">{b.mechanic || 'Unassigned'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">₹{b.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value || 0}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    </div>
  );
}