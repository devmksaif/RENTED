const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
 
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// Update CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rented', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ Error connecting to MongoDB:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('RENTED API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
