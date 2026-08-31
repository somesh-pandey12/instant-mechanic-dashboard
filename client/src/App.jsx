import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Wrench, CalendarCheck, Clock, CheckCircle2, XCircle, DollarSign, Users, UserCheck, Search, Download, Sun, Moon, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function App() {
  const [metrics, setMetrics] = useState({});
  const [charts, setCharts] = useState({ serviceBreakdown: [], statusBreakdown: [] });
  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const fetchData = async () => {
    try {
      const [dashRes, bookingsRes, mechRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard`),
        axios.get(`${API_URL}/api/bookings`),
        axios.get(`${API_URL}/api/mechanics`)
      ]);
      setMetrics(dashRes.data.metrics || {});
      setCharts(dashRes.data.charts || { serviceBreakdown: [], statusBreakdown: [] });
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setMechanics(Array.isArray(mechRes.data) ? mechRes.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const headers = ["Booking ID,Customer,Vehicle,Service,Mechanic,Status,Amount,Date\n"];
    const rows = filteredBookings.map(b => 
      `"${b.bookingId || b._id}","${b.customerName || b.customer}","${b.vehicle}","${b.service}","${b.mechanic || 'Unassigned'}","${b.status}",${b.amount},"${new Date(b.createdAt).toLocaleDateString()}"`
    );
    const blob = new Blob([...headers, rows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bookings_Export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filteredBookings = bookings.filter(b => {
    const cust = b.customerName || b.customer || '';
    const bId = b.bookingId || b._id || '';
    const srv = b.service || '';
    
    const matchesSearch = cust.toLowerCase().includes(search.toLowerCase()) ||
                          bId.toLowerCase().includes(search.toLowerCase()) ||
                          srv.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage) || 1;
  const paginatedBookings = filteredBookings.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Top Navbar */}
      <header className={`p-4 shadow-sm border-b transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 text-white border-slate-800'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wrench className="text-amber-400 w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">Instant Mechanic</h1>
              <p className="text-xs text-slate-400">Live Service Operations Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2 rounded-lg border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className="flex items-center text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping mr-2"></span>
              Live Sync Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Overview Cards */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold tracking-tight">System Overview</h2>
            <button onClick={fetchData} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard darkMode={darkMode} title="Total Bookings" value={metrics.totalBookings} icon={<CalendarCheck className="text-blue-500"/>} />
            <MetricCard darkMode={darkMode} title="Today's Bookings" value={metrics.todayBookings} icon={<Clock className="text-indigo-500"/>} />
            <MetricCard darkMode={darkMode} title="Completed" value={metrics.completed} icon={<CheckCircle2 className="text-emerald-500"/>} />
            <MetricCard darkMode={darkMode} title="Pending" value={metrics.pending} icon={<Clock className="text-amber-500"/>} />
            <MetricCard darkMode={darkMode} title="Cancelled" value={metrics.cancelled} icon={<XCircle className="text-rose-500"/>} />
            <MetricCard darkMode={darkMode} title="Total Revenue" value={`₹${metrics.totalRevenue || 0}`} icon={<DollarSign className="text-emerald-600"/>} />
            <MetricCard darkMode={darkMode} title="Active Mechanics" value={metrics.activeMechanics} icon={<UserCheck className="text-cyan-500"/>} />
            <MetricCard darkMode={darkMode} title="New Customers" value={metrics.newCustomers} icon={<Users className="text-violet-500"/>} />
          </div>
        </section>

        {/* Visual Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-75">Service Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.serviceBreakdown}>
                  <XAxis dataKey="_id" tick={{fontSize: 10, fill: darkMode ? '#94A3B8' : '#64748B'}} />
                  <YAxis tick={{fill: darkMode ? '#94A3B8' : '#64748B'}} />
                  <Tooltip contentStyle={{backgroundColor: darkMode ? '#1E293B' : '#FFF', borderRadius: '8px'}} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-75">Booking Status Analytics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={85} label>
                    {charts.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: darkMode ? '#1E293B' : '#FFF', borderRadius: '8px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Operational Bookings Table */}
        <section className={`rounded-2xl border transition-all overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="p-4 border-b border-slate-200/20 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-base font-bold">Bookings Operational Queue</h3>
              <p className="text-xs text-slate-400">Manage real-time vehicle maintenance requests</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={exportCSV} 
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search customer/ID/service..." 
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className={`pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className={`py-2 px-3 text-sm border rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} font-medium`}>
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Mechanic</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {loading ? (
                  <tr><td colSpan="8" className="text-center p-6 text-slate-400">Loading operations feed...</td></tr>
                ) : paginatedBookings.length === 0 ? (
                  <tr><td colSpan="8" className="text-center p-6 text-slate-400">No active operational bookings found.</td></tr>
                ) : (
                  paginatedBookings.map((b) => (
                    <tr key={b._id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 font-semibold text-blue-500">{b.bookingId || b._id?.substring(0,6) || 'N/A'}</td>
                      <td className="p-4 font-medium">{b.customerName || b.customer || 'N/A'}</td>
                      <td className="p-4 text-slate-400">{b.vehicle || 'N/A'}</td>
                      <td className="p-4 text-slate-400">{b.service || 'N/A'}</td>
                      <td className="p-4 text-slate-400">{b.mechanic || 'Unassigned'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          b.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          b.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {b.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">₹{b.amount || 0}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200/20 flex justify-between items-center text-xs">
            <span className="text-slate-400">Showing page {page} of {totalPages}</span>
            <div className="space-x-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >Previous</button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >Next</button>
            </div>
          </div>
        </section>

        {/* Mechanics Section */}
        <section>
          <h3 className="text-lg font-bold mb-4">Mechanics Real-time Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mechanics.map((m) => (
              <div key={m._id} className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold">{m.name}</h4>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {m.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>Completed Jobs: <span className="font-semibold text-slate-200">{m.jobsCompleted || 0}</span></p>
                  <p>Current Assignment: <span className="font-medium text-blue-400">{m.currentBooking || 'Available'}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, darkMode }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold mt-1">{value || 0}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{icon}</div>
      </div>
    </div>
  );
}