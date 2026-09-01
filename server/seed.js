const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const Booking = mongoose.model('Booking', new mongoose.Schema({
  bookingId: String, customerName: String, vehicle: String,
  service: String, mechanic: String, status: String, amount: Number, createdAt: Date
}));

const Mechanic = mongoose.model('Mechanic', new mongoose.Schema({
  name: String, status: String, jobsCompleted: Number, currentBooking: String
}));

const services = ["Engine Oil Change", "Brake Repair", "Full AC Service", "Wheel Alignment", "Battery Replacement"];
const mechanicsList = ["Amit Kumar", "Rajesh Verma", "Suresh Gupta", "Pooja Sharma", "Vikas Reddy"];
const statuses = ["Pending", "In Progress", "Completed", "Cancelled"];

async function seed() {
  await Booking.deleteMany({});
  await Mechanic.deleteMany({});

  const sampleBookings = [];
  for (let i = 1; i <= 50; i++) {
    sampleBookings.push({
      bookingId: `BK-10${i}`,
      customerName: `Customer ${i}`,
      vehicle: `Car Model ${i % 5}`,
      service: services[i % services.length],
      mechanic: mechanicsList[i % mechanicsList.length],
      status: statuses[i % statuses.length],
      amount: (i % 5 + 1) * 800,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000)
    });
  }
  await Booking.insertMany(sampleBookings);

  const sampleMechanics = mechanicsList.map((name, idx) => ({
    name,
    status: idx % 2 === 0 ? 'Active' : 'Busy',
    jobsCompleted: 10 + idx * 5,
    currentBooking: `BK-10${idx + 1}`
  }));
  await Mechanic.insertMany(sampleMechanics);

  console.log("Database Seeded Successfully!");
  mongoose.connection.close();
}

seed();