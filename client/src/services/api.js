import axios from "axios";

// Assuming backend mounts userRoutes under /api/users
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Product APIs
export const getProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(`${API_URL}/products?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};


// Get a single listing by ID
export const getListing = async (id) => {
  try {
    const response = await axios.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a listing
export const updateListing = async (id, listingData) => {
  try {
    const response = await axios.patch(`/api/products/${id}`, listingData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const updateUserStatusToPending = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/users/update/${id}`, { 
      updates: 'pending' // Send the string directly, not an object
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user verification status:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const checkVerificationStatus = async () => {
  try {
    const userProfile = await getUserProfile();
    return userProfile.verificationStatus;
  } catch (error) {
    console.error("Error checking verification status:", error);
    return "still"; 
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/products/${id}`,
      productData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/products/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Cart APIs
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    // Return empty cart on error
    return { items: [] };
  }
};

export const addToCart = async (
  productId,
  quantity = 1,
  duration = 7,
  startDate = null,
  endDate = null
) => {
   
  try {
    const response = await axios.post(
      `${API_URL}/cart/add`,
      {
        productId,
        quantity,
        duration,
        startDate,
        endDate,
      },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (productId, quantity, duration, startDate, endDate) => {
  try {
    // First get the current cart
    const currentCart = await getCart();

    // Find the item and update it
    const updatedItems = currentCart.items.map((item) => {
      if (item.product._id === productId) {
        return {
          ...item,
          quantity: quantity,
          duration: duration,
          startDate: startDate,
          endDate: endDate
        };
      }
      return item;
    });

    // Update the entire cart
    return updateCart({
      items: updatedItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.price,
        duration: item.duration,
        startDate: item.startDate,
        endDate: item.endDate
      })),
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/cart/item/${productId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await axios.delete(`${API_URL}/cart/clear`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Save cart to local storage
export const saveCart = async (cartData) => {
  try {
    // Always update local storage first with consistent structure
    const localCart = JSON.parse(
      localStorage.getItem("cart") || '{"items":[]}'
    );

    // If we have a productId, it's a single item update
    if (cartData.productId) {
      const existingItemIndex = localCart.items.findIndex(
        (item) => item.product && item.product._id === cartData.productId
      );

      if (existingItemIndex > -1) {
        // Update existing item
        localCart.items[existingItemIndex].quantity =
          cartData.quantity || localCart.items[existingItemIndex].quantity;
        if (cartData.duration) {
          localCart.items[existingItemIndex].duration = cartData.duration;
        }
        if (cartData.startDate) {
          localCart.items[existingItemIndex].startDate = cartData.startDate;
        }
        if (cartData.endDate) {
          localCart.items[existingItemIndex].endDate = cartData.endDate;
        }
      } else {
        // Fetch product details if not already in cart
        try {
          const product = await getProductById(cartData.productId);
          localCart.items.push({
            product: {
              _id: product._id,
              title: product.title,
              image: product.image || product.images?.[0],
              price: product.price,
              category: product.category,
              availability: product.availability,
              minRentalDays: product.minRentalDays,
              maxRentalDays: product.maxRentalDays,
            },
            quantity: cartData.quantity || 1,
            duration: cartData.duration || 7,
            startDate: cartData.startDate || null,
            endDate: cartData.endDate || null,
            totalPrice:
              product.price *
              (cartData.quantity || 1) *
              (cartData.duration || 7),
          });
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
    } else if (Array.isArray(cartData)) {
      // If cartData is an array, replace the entire cart
      localCart.items = cartData;
    } else if (cartData.items && Array.isArray(cartData.items)) {
      // If cartData has an items array, use that
      localCart.items = cartData.items;
    }

    // Save to local storage
    localStorage.setItem("cart", JSON.stringify(localCart));

    // Dispatch custom event for cart update
    window.dispatchEvent(new Event("cartUpdated"));

    // If user is logged in, sync with server
    if (localStorage.getItem("token")) {
      try {
        if (cartData.productId) {
          // Single item update
          await addToCart(
            cartData.productId,
            cartData.quantity || 1,
            cartData.duration || 7,
            cartData.startDate,
            cartData.endDate
          );
        } else {
          // Full cart update
          // Format items for the backend API
          const items = Array.isArray(cartData)
            ? cartData
            : cartData.items && Array.isArray(cartData.items)
            ? cartData.items
            : localCart.items;

          const formattedItems = items.map((item) => ({
            productId: item.product?._id || item.product,
            quantity: item.quantity || 1,
            price: item.price,
            duration: item.duration || 7,
            startDate: item.startDate,
            endDate: item.endDate
          }));

          await updateCart({ items: formattedItems });
        }
      } catch (error) {
        console.error("Error syncing cart with server:", error);
        // Continue with local cart even if server sync fails
      }
    }

    return localCart;
  } catch (error) {
    console.error("Error saving cart:", error);
    throw error;
  }
};

// Booking APIs
export const createBooking = async (bookingData) => {
  try {
    // Ensure all required fields are present
    if (!bookingData.productId) {
      throw new Error("Product ID is required");
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      throw new Error("Start and end dates are required");
    }

    // Create a copy of the booking data to avoid mutating the original
    const processedBookingData = { ...bookingData };

    // Convert dates to ISO string if they are Date objects
    if (processedBookingData.startDate instanceof Date) {
      processedBookingData.startDate =
        processedBookingData.startDate.toISOString();
    }

    if (processedBookingData.endDate instanceof Date) {
      processedBookingData.endDate = processedBookingData.endDate.toISOString();
    }

    // Ensure quantity is at least 1
    if (!processedBookingData.quantity || processedBookingData.quantity < 1) {
      processedBookingData.quantity = 1;
    }

    // Ensure paymentMethod is one of the accepted values
    const validPaymentMethods = [
      "credit-card",
      "paypal",
      "apple-pay",
      "google-pay",
      "cash-on-delivery",
    ];
    if (!validPaymentMethods.includes(processedBookingData.paymentMethod)) {
      processedBookingData.paymentMethod = "cash-on-delivery"; // Default to cash on delivery
    }

    console.log("Sending booking data to API:", processedBookingData);

    const response = await axios.post(
      `${API_URL}/bookings/create`,
      processedBookingData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);

    // Enhanced error information
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        "Server error occurred during booking creation";
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      throw enhancedError;
    } else if (error.request) {
      throw new Error(
        "Network error during booking creation. Please try again."
      );
    }

    throw error;
  }
};
export const getUserById = async (user) => {
  try {
    const response = await axios.get(`${API_URL}/users/user/${user}`);
    return response.data;
  } catch (error) {
     return {};
  }
}

export const getUserBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings/user`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

export const getOwnerBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings/owner`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/bookings/${id}/status`,
      { status },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

export const cancelBooking = async (id, reason) => {
  try {
    const response = await axios.delete(
      `${API_URL}/bookings/${id}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error canceling booking:", error);
    throw error;
  }
};

// Payment APIs
export const processPayment = async (paymentData) => {
  try {
    // Validate required fields
    if (
      !paymentData.bookingIds ||
      !Array.isArray(paymentData.bookingIds) ||
      paymentData.bookingIds.length === 0
    ) {
      throw new Error("No booking IDs provided for payment processing");
    }

    if (!paymentData.paymentMethod) {
      throw new Error("Payment method is required");
    }

    if (
      !paymentData.amount ||
      isNaN(paymentData.amount) ||
      paymentData.amount <= 0
    ) {
      throw new Error("Valid payment amount is required");
    }

    // Make sure payment method is one of the accepted values
    const validPaymentMethods = [
      "credit-card",
      "paypal",
      "apple-pay",
      "google-pay",
      "cash-on-delivery",
    ];
    if (!validPaymentMethods.includes(paymentData.paymentMethod)) {
      throw new Error("Invalid payment method");
    }

    const response = await axios.post(
      `${API_URL}/bookings/payment`,
      paymentData,
      {
        headers: getAuthHeader(),
        timeout: 15000, // Add a reasonable timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error processing payment:", error);

    // Enhance error information for better handling in the UI
    if (error.response) {
      // The server responded with an error status
      const errorMessage =
        error.response.data?.message || "Payment processing failed";
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      throw enhancedError;
    } else if (error.request) {
      // The request was made but no response received (network issues)
      throw new Error(
        "Network error during payment processing. Please try again."
      );
    }

    // For other errors, rethrow
    throw error;
  }
};

export const getUserPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/payments/user`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user payments:", error);
    throw error;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/payments/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};

export const requestRefund = async (paymentId, reason) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/${paymentId}/refund`,
      { reason },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting refund:", error);
    throw error;
  }
};

// Review APIs
export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }
};

export const getUserReviews = async () => {
  try {
    const response = await axios.get(`${API_URL}/reviews/user`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await axios.patch(`${API_URL}/reviews/${id}`, reviewData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reviews/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// Notification APIs
export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// User APIs
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      ...credentials
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
export const loginUserGoogle = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login-google`, {
      ...credentials
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// User Profile APIs
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const checkEmail = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/users/check`, { email });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};


export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/profile`, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateUserMeetingArea = async (meetingAreaData) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/meeting-areas`,
      meetingAreaData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating meeting area:", error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/users/password`,
      passwordData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Admin APIs
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getAllBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/bookings`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    throw error;
  }
};

export const adminUpdateBookingStatus = async (id, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/admin/bookings/${id}/status`,
      { status },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

export const adminGetAllProducts = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters,
    });

    const response = await axios.get(
      `${API_URL}/admin/products?${queryParams}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
};

export const adminDeleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/products/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// For Cart.js
export const updateCart = async (cartData) => {
  try {
    const response = await axios.put(`${API_URL}/cart`, cartData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

// For NotificationContext.js

// For AdminDashboard.js
export const getAdminProducts = async () => {
  // This is an alias for adminGetAllProducts for backward compatibility
  return adminGetAllProducts();
};

export const getAdminBookings = async () => {
  // This is an alias for getAllBookings for backward compatibility
  return getAllBookings();
};

export const getAdminUsers = async () => {
  // This is an alias for getAllUsers for backward compatibility
  return getAllUsers();
};

// For CreateListing.js
export const createListing = async (listingData) => {
  // This is an alias for createProduct for backward compatibility
  return createProduct(listingData);
};

// For ListingsList.js
export const getUserListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/user`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw error;
  }
};

// Add this function to get nearby products
export const getNearbyProducts = async (
  latitude,
  longitude,
  radius = 10,
  filters = {}
) => {
  try {
    const queryParams = new URLSearchParams({
      lat: latitude,
      lng: longitude,
      radius,
    });

    // Add additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(
      `${API_URL}/products/nearby?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    throw error;
  }
};

// Add geocoding function
export const geocodeLocation = async (address) => {
  try {
    // You could use a third-party geocoding service here
    // For this example, we'll use OpenStreetMap Nominatim API
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "RENTED App",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw error;
  }
};

// Add reverse geocoding function
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "User-Agent": "RENTED App",
        },
      }
    );

    if (response.data) {
      return response.data.display_name;
    }
    return null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    throw error;
  }
};


// Messaging APIs
export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations/${conversationId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const sendMessage = async (recipientId, content, productId = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/messages/send`,
      {
        recipientId,
        content,
        productId
      },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getUnreadMessageCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/unread/count`, {
      headers: getAuthHeader(),
    });
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return 0;
  }
};

export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/messages/conversations/${conversationId}/read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

// Add new function for completing Google registration on the backend
export const completeGoogleRegistration = async (userData) => {
  try {
    // This endpoint should be the new route you created on the backend
    const response = await axios.post(`${API_URL}/users/register`, userData);
    // The backend should return the user object and a token
    return response.data;
  } catch (error) {
    console.error("Error completing Google registration on backend:", error);
    throw error; // Re-throw to be caught by the calling component
  }
};
