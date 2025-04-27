const Product = require('../models/Product');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product')
      .populate('user', 'name email');
    
    res.status(200).json({
      stats: {
        totalProducts,
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingBookings
      },
      recentProducts,
      recentBookings
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all products with pagination and filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, sort } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (category) query.category = category;
    
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
      
    const totalProducts = await Product.countDocuments(query);
    
    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings with pagination and filtering
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status) query.status = status;
    
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    
    const bookings = await Booking.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('product')
      .populate('user', 'name email');
      
    const totalBookings = await Booking.countDocuments(query);
    
    res.status(200).json({
      bookings,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');
      
    const totalUsers = await User.countDocuments(query);
    
    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('product').populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Also delete any bookings associated with this product
    await Booking.deleteMany({ product: id });
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};