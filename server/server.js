const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Schemas
const bookingSchema = new mongoose.Schema({
  bookingId: String,
  customerName: String,
  vehicle: String,
  service: String,
  mechanic: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'] },
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

const mechanicSchema = new mongoose.Schema({
  name: String,
  status: { type: String, enum: ['Active', 'Busy', 'Offline'] },
  jobsCompleted: Number,
  currentBooking: String
});

const Booking = mongoose.model('Booking', bookingSchema);
const Mechanic = mongoose.model('Mechanic', mechanicSchema);

// API Endpoints
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: today } });
    const completed = await Booking.countDocuments({ status: 'Completed' });
    const pending = await Booking.countDocuments({ status: 'Pending' });
    const cancelled = await Booking.countDocuments({ status: 'Cancelled' });
    
    const revGroup = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revGroup[0]?.total || 0;
    
    const activeMechanics = await Mechanic.countDocuments({ status: { $in: ['Active', 'Busy'] } });
    const newCustomers = (await Booking.distinct('customerName')).length;

    // Chart Data Generation
    const serviceBreakdown = await Booking.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      metrics: {
        totalBookings, todayBookings, completed, pending, cancelled,
        totalRevenue, activeMechanics, newCustomers
      },
      charts: { serviceBreakdown, statusBreakdown }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

app.get('/api/mechanics', async (req, res) => {
  const mechanics = await Mechanic.find();
  res.json(mechanics);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));