const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');

// Routes imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const householdRoutes = require('./routes/household.routes');
const feeRoutes = require('./routes/fee.routes');
const paymentSessionRoutes = require('./routes/paymentSession.routes');
const transactionRoutes = require('./routes/transaction.routes');

dotenv.config();
connectDB();

const app = express();
// Middleware
app.use(express.json()); // Parse JSON body
app.use(cors()); // Enable CORS for Frontend

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/paymentSessions', paymentSessionRoutes);
app.use('/api/transactions', transactionRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
