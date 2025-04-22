import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { saveCart } from "../services/api" // Add this import
import { getProductById } from '../services/api'; // Add this import
import '../styles/ProductDetail.css';

function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [rentalDuration, setRentalDuration] = useState(7);
  const [dateError, setDateError] = useState('');
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
        
        // Set default rental duration to minRentalDays if available
        if (data.minRentalDays) {
          setRentalDuration(data.minRentalDays);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Calculate rental duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Validate against min/max rental days
      if (product) {
        const minDays = product.minRentalDays || 1;
        const maxDays = product.maxRentalDays || 30;
        
        if (diffDays < minDays) {
          setDateError(`Minimum rental period is ${minDays} days`);
        } else if (diffDays > maxDays) {
          setDateError(`Maximum rental period is ${maxDays} days`);
        } else {
          setDateError('');
          setRentalDuration(diffDays);
        }
      } else {
        setRentalDuration(diffDays || 1);
      }
    }
  }, [startDate, endDate, product]);

  const handleAddToCart = async () => {
    if (product) {
      try {
        if (product.availability !== 'Available') {
          setError('This product is not currently available for rent');
          return;
        }

        // Validate rental duration against min/max
        const minDays = product.minRentalDays || 1;
        const maxDays = product.maxRentalDays || 30;
        
        if (rentalDuration < minDays || rentalDuration > maxDays) {
          setDateError(`Rental period must be between ${minDays} and ${maxDays} days`);
          return;
        }
        
        if (onAddToCart) {
          await onAddToCart(product, rentalDuration, quantity, startDate, endDate);
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 3000);
        } else {
          const totalPrice = product.price * quantity * rentalDuration;
          
          await saveCart({
            productId: product._id,
            quantity: quantity,
            duration: rentalDuration,
            startDate: startDate,
            endDate: endDate,
            totalPrice: totalPrice
          });
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      } catch (error) {
        console.error('Error adding to cart:', error);
        setError('Failed to add item to cart. Please try again.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <p className="error-message">{error}</p>
        <Link to="/" className="back-button">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-container">
        <div className="not-found-icon">
          <i className="fas fa-search"></i>
        </div>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-button">
          Back to Products
        </Link>
      </div>
    );
  }

  // Use product images array or fallback to single image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || "https://via.placeholder.com/600x400"];

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / 
        <Link to={`/category/${product.category}`}>{product.category}</Link> / 
        <span>{product.title}</span>
      </div>
      
      <div className="product-detail">
        <div className="product-gallery">
          <div className="main-image-container">
            <img 
              src={productImages[activeImage]} 
              alt={product.title} 
              className="main-product-image" 
            />
            {product.featured && (
              <div className="featured-badge">
                <i className="fas fa-star"></i> Featured
              </div>
            )}
            {product.availability !== "Available" && (
              <div className={`availability-badge ${product.availability.toLowerCase()}`}>
                {product.availability}
              </div>
            )}
          </div>
          
          {productImages.length > 1 && (
            <div className="thumbnail-container">
              {productImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={img} alt={`${product.title} - view ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{product.title}</h1>
          
          <div className="product-meta">
            <div className="product-rating">
              <i className="fas fa-star"></i>
              <span>{product.rating.toFixed(1)}</span>
              <span className="review-count">({product.reviews} reviews)</span>
            </div>
            <div className="product-location">
              <i className="fas fa-map-marker-alt"></i>
              <span>{product.location}</span>
            </div>
            {product.condition && (
              <div className="product-condition">
                <i className="fas fa-tag"></i>
                <span>{product.condition}</span>
              </div>
            )}
          </div>
          
          <div className="product-price">
            <span className="price-amount">${product.price}</span>
            <span className="price-period">/ day</span>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          {product.features && product.features.length > 0 && (
            <div className="product-features-section">
              <h3>Features</h3>
              <ul className="features-list">
                {product.features.map((feature, index) => (
                  <li key={index}><i className="fas fa-check"></i> {feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="product-availability">
            <h3>Availability</h3>
            <div className="availability-status">
              <span className={`status-indicator ${product.availability.toLowerCase()}`}></span>
              <span>{product.availability}</span>
            </div>
          </div>
          
          <div className="booking-form">
            <h3>Book Now</h3>
            
            {product.minRentalDays && product.maxRentalDays && (
              <div className="rental-constraints">
                <i className="fas fa-info-circle"></i>
                <span>Rental period: {product.minRentalDays} to {product.maxRentalDays} days</span>
              </div>
            )}
            
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">Start Date</label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">End Date</label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            
            {dateError && (
              <div className="date-error-message">
                <i className="fas fa-exclamation-circle"></i> {dateError}
              </div>
            )}
            
            {startDate && endDate && (
              <div className="rental-summary">
                <div className="rental-period">
                  <span>Rental Period:</span>
                  <span>{formatDate(startDate)} - {formatDate(endDate)} ({rentalDuration} days)</span>
                </div>
                <div className="rental-calculation">
                  <div className="calc-row">
                    <span>${product.price} × {quantity} {quantity > 1 ? 'items' : 'item'} × {rentalDuration} days</span>
                    <span>${(product.price * quantity * rentalDuration).toFixed(2)}</span>
                  </div>
                  {product.deposit > 0 && (
                    <div className="calc-row">
                      <span>Security Deposit (refundable)</span>
                      <span>${product.deposit.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="calc-row total">
                    <span>Total</span>
                    <span>${((product.price * quantity * rentalDuration) + (product.deposit || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="product-actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                  aria-label="Decrease quantity"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                  aria-label="Increase quantity"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={
                  product?.availability !== 'Available' || 
                  !startDate || 
                  !endDate || 
                  !!dateError
                }
              >
                <i className="fas fa-shopping-cart"></i> Add to Cart
              </button>
            </div>
            
            {!startDate || !endDate ? (
              <div className="date-required-message">
                <i className="fas fa-info-circle"></i> Please select rental dates
              </div>
            ) : null}
            
            {addedToCart && (
              <div className="added-to-cart-message">
                <i className="fas fa-check-circle"></i> Added to cart!
              </div>
            )}
          </div>
          
          <div className="owner-info">
            <h3>About the Owner</h3>
            <div className="owner-profile">
              <div className="owner-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="owner-details">
                <div className="owner-name">Verified Owner</div>
                <div className="owner-rating">
                  <i className="fas fa-star"></i> 4.8 (120 rentals)
                </div>
              </div>
              <button className="contact-owner-btn">
                <i className="fas fa-comment"></i> Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;