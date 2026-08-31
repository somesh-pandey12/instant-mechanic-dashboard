# Instant Mechanic - Live Vehicle Service Operations Dashboard

A real-time production-ready Operations Dashboard designed for **Instant Mechanic** to monitor vehicle service bookings, mechanic workloads, operational metrics, and revenue analytics.

## Project Overview
This full-stack SaaS application serves operations teams by providing live visibility into service booking lifecycles, real-time polling updates, visual chart breakdowns, dark mode toggle, export capabilities, and mechanic assignment tracking.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Frontend), Render / AWS (Backend)

---

## System Architecture

┌─────────────────────────┐
│     React (Vite UI)     │
└────────────┬────────────┘
│ Axios API Requests & 10s Polling
▼
┌─────────────────────────┐
│   Node.js / Express     │
└────────────┬────────────┘
│ Mongoose ORM
▼
┌─────────────────────────┐
│  MongoDB Cloud Database │
└─────────────────────────┘

---

## Features Implemented
- **Overview Metrics**: Live tracking of Total Bookings, Today's Bookings, Completed, Pending, Cancelled, Revenue, Active Mechanics, and New Customers.
- **Visual Analytics**: Interactive Recharts for Service Category distribution and Booking Status percentages.
- **Operational Queue**: Paginated, searchable, status-filtered bookings table with CSV export function.
- **Mechanics Roster**: Real-time status cards showing job completion numbers and current active assignments.
- **Dark Mode**: Toggle theme built with Tailwind dark state variants.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI

### 1. Clone Repository
```bash
git clone [https://github.com/somesh-pandey12/instant-mechanic-dashboard.git]
cd instant-mechanic-dashboard

cd server
npm install
# Create .env file:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000

# Seed Sample Data
node seed.js

# Start Backend Server
node server.js

cd ../client
npm install
# Create .env file:
# VITE_API_URL=http://localhost:5000

npm run dev

Open http://localhost:5173 in your browser.

Environment Variables
Backend (server/.env)
MONGO_URI: MongoDB connection string.

PORT: Express server port (Default: 5000).

Frontend (client/.env)
VITE_API_URL: Backend server URL.

Core API Endpoints
GET /api/dashboard: Aggregated metrics and analytic breakdowns for charts.

GET /api/bookings: Array of all operational vehicle bookings.

GET /api/mechanics: Real-time roster of mechanic status and active assignments.

AI Usage Disclosure
AI Tools Used: ChatGPT / Gemini for boilerplate architecture generation and schema design.

Key Contributions: Prompting for optimized Mongoose pipeline queries and Tailwind UI components.

Custom Implementations: Modified React state handling, integrated CSV export handlers, customized Tailwind color theme, and fixed API CORS synchronization.


---
