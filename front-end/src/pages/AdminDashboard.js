// Update the imports to use the correct function names
import React, { useState, useEffect } from 'react';
import { getAdminProducts, getAdminBookings, getAdminUsers, deleteProduct, updateBookingStatus } from '../services/api';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, bookingsData, usersData] = await Promise.all([
        getAdminProducts(), // Changed from getProducts()
        getAdminBookings(), // Changed from getBookings()
        getAdminUsers()     // Changed from getUsers()
      ]);
      
      setProducts(productsData);
      setBookings(bookingsData);
      setUsers(usersData);
      
      // Calculate dashboard stats
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const pendingBookings = bookingsData.filter(booking => booking.status === 'pending').length;
      
      setStats({
        totalProducts: productsData.length,
        totalBookings: bookingsData.length,
        totalUsers: usersData.length,
        totalRevenue,
        pendingBookings
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product._id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>RENTED</h2>
          <span className="admin-logo-dot"></span>
        </div>
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Overview</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="fas fa-box"></i>
            <span>Products</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Bookings</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i>
            <span>Users</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
        </nav>
        <div className="admin-logout">
          <button className="admin-logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'products' && 'Manage Products'}
            {activeTab === 'bookings' && 'Manage Bookings'}
            {activeTab === 'users' && 'Manage Users'}
            {activeTab === 'settings' && 'Dashboard Settings'}
          </h1>
          <div className="admin-header-actions">
            <div className="admin-search">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search..." />
            </div>
            <div className="admin-profile">
              <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Admin" />
              <span>Admin User</span>
            </div>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon products">
                  <i className="fas fa-box"></i>
                </div>
                <div className="stat-details">
                  <h3>Total Products</h3>
                  <p className="stat-value">{stats.totalProducts}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bookings">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-details">
                  <h3>Total Bookings</h3>
                  <p className="stat-value">{stats.totalBookings}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon users">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-details">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon revenue">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-details">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="admin-recent-section">
              <div className="admin-recent-bookings">
                <div className="section-header">
                  <h2>Recent Bookings</h2>
                  <button onClick={() => setActiveTab('bookings')}>View All</button>
                </div>
                <div className="recent-list">
                  {bookings.slice(0, 5).map(booking => (
                    <div key={booking._id} className="recent-item">
                      <div className="recent-item-info">
                        <h4>{booking.product?.title || 'Product'}</h4>
                        <p>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                          <span className="recent-date">
                            {new Date(booking.startDate).toLocaleDateString()} - 
                            {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <div className="recent-item-price">
                        ${booking.totalPrice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="admin-recent-products">
                <div className="section-header">
                  <h2>Recent Products</h2>
                  <button onClick={() => setActiveTab('products')}>View All</button>
                </div>
                <div className="recent-list">
                  {products.slice(0, 5).map(product => (
                    <div key={product._id} className="recent-item">
                      <div className="recent-item-image">
                        <img src={product.image} alt={product.title} />
                      </div>
                      <div className="recent-item-info">
                        <h4>{product.title}</h4>
                        <p>
                          <span className="category-badge">{product.category}</span>
                          <span className="recent-location">
                            <i className="fas fa-map-marker-alt"></i> {product.location}
                          </span>
                        </p>
                      </div>
                      <div className="recent-item-price">
                        ${product.price}/day
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="admin-products">
            <div className="admin-actions">
              <button className="admin-add-btn">
                <i className="fas fa-plus"></i> Add New Product
              </button>
              <div className="admin-filters">
                <select defaultValue="">
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Sports">Sports</option>
                  <option value="Tools">Tools</option>
                </select>
                <select defaultValue="newest">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>
                        <img src={product.image} alt={product.title} className="product-thumbnail" />
                      </td>
                      <td>{product.title}</td>
                      <td>{product.category}</td>
                      <td>${product.price}/day</td>
                      <td>{product.location}</td>
                      <td>
                        <span className={`status-badge ${product.availability?.toLowerCase()}`}>
                          {product.availability || 'Available'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'bookings' && (
          <div className="admin-bookings">
            <div className="admin-filters">
              <select defaultValue="">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select defaultValue="newest">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Product</th>
                    <th>User</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id}>
                      <td>#{booking._id.slice(-6)}</td>
                      <td>{booking.product?.title || 'Product'}</td>
                      <td>{booking.user?.name || 'User'}</td>
                      <td>
                        {new Date(booking.startDate).toLocaleDateString()} - 
                        {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td>${booking.totalPrice}</td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <select 
                          value={booking.status}
                          onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                        <button className="action-btn view">
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="admin-filters">
              <select defaultValue="">
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input type="text" placeholder="Search users..." className="admin-search-input" />
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="user-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>{user.role || 'user'}</td>
                      <td>
                        <span className={`status-badge ${user.status || 'active'}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="action-btn delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="admin-settings">
            <div className="settings-card">
              <h2>General Settings</h2>
              <form className="settings-form">
                <div className="form-group">
                  <label>Site Name</label>
                  <input type="text" defaultValue="RENTED" />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input type="email" defaultValue="admin@rented.com" />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select defaultValue="USD">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <button type="submit" className="settings-save-btn">Save Changes</button>
              </form>
            </div>
            
            <div className="settings-card">
              <h2>Email Notifications</h2>
              <div className="notification-settings">
                <div className="notification-option">
                  <div>
                    <h4>New Booking Notifications</h4>
                    <p>Receive email when a new booking is made</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="notification-option">
                  <div>
                    <h4>User Registration Notifications</h4>
                    <p>Receive email when a new user registers</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="notification-option">
                  <div>
                    <h4>Product Review Notifications</h4>
                    <p>Receive email when a product receives a review</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;