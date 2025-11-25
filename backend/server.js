const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');

// Routes imports
const authRoutes = require('./routes/auth.routes');
const householdRoutes = require('./routes/household.routes');
// const feeRoutes = require('./routes/fee.routes'); // Uncomment khi đã tạo file

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(cors()); // Enable CORS for Frontend

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
// app.use('/api/fees', feeRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
