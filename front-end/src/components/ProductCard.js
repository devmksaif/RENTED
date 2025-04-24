"use client"
import { Link } from "react-router-dom"
import "../styles/ProductCard.css"
import { useState } from "react"
import { saveCart } from "../services/api" // Add this import

function ProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showRentalOptions, setShowRentalOptions] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(product.minRentalDays || 7);
  const [addSuccess, setAddSuccess] = useState(false);
  
  // Generate rental duration options based on product's min and max rental days
  const getDurationOptions = () => {
    const minDays = product.minRentalDays || 1;
    const maxDays = product.maxRentalDays || 30;
    const options = [];
    
    // Create options in increments (1 day for short rentals, weekly for longer ones)
    const increment = maxDays > 14 ? 7 : 1;
    
    for (let i = minDays; i <= maxDays; i += increment) {
      options.push(i);
    }
    
    // Always include the max days if it's not already included
    if (options[options.length - 1] !== maxDays) {
      options.push(maxDays);
    }
    
    return options;
  };
  
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>)
    }

    if (halfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>)
    }

    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>)
    }

    return stars
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (showRentalOptions) {
      // If rental options are shown, add to cart with selected duration
      if (onAddToCart) {
        onAddToCart(product, selectedDuration);
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      }
      setShowRentalOptions(false);
    } else {
      // Show rental options first
      setShowRentalOptions(true);
    }
  }
  
  const handleRentalSelect = (e, duration) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDuration(duration);
  };
  
  const handleConfirmRental = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product || product.availability !== 'Available') {
      console.error('Product is not available for rent');
      return;
    }
    
    // Validate rental duration against min/max if available
    if (product.minRentalDays && selectedDuration < product.minRentalDays) {
      console.error(`Minimum rental period is ${product.minRentalDays} days`);
      return;
    }
    
    if (product.maxRentalDays && selectedDuration > product.maxRentalDays) {
      console.error(`Maximum rental period is ${product.maxRentalDays} days`);
      return;
    }
    
    if (onAddToCart) {
      try {
        await onAddToCart(product, selectedDuration);
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      try {
        await saveCart({
          productId: product._id,
          quantity: 1,
          duration: selectedDuration
        });
        
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
    setShowRentalOptions(false);
  };
  
  const handleCancelRental = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRentalOptions(false);
  };
  
  // Format condition badge
  const getConditionBadge = () => {
    if (!product.condition) return null;
    
    const conditionColors = {
      'New': '#4CAF50',
      'Like New': '#8BC34A',
      'Good': '#FFC107',
      'Fair': '#FF9800',
      'Poor': '#F44336'
    };
    
    return (
      <div 
        className="condition-badge"
        style={{ backgroundColor: conditionColors[product.condition] || '#757575' }}
      >
        {product.condition}
      </div>
    );
  };

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!showRentalOptions) {
          setSelectedDuration(product.minRentalDays || 7);
        }
      }}
    >
      <div className="product-card-inner">
        <Link to={`/product/${product._id}`} className="product-card-link">
          <div className="product-image">
            <img 
              src={product.image || "https://via.placeholder.com/300x200"} 
              alt={product.title} 
              className={`full-image ${isHovered ? "zoom" : ""}`}
            />
            <div className="product-price">${product.price}<span>/day</span></div>
            
            {product.availability !== "Available" && (
              <div className={`availability-badge ${product.availability.toLowerCase()}`}>
                {product.availability}
              </div>
            )}
            {getConditionBadge()}
            {product.featured && (
              <div className="featured-badge">
                <i className="fas fa-star"></i> Featured
              </div>
            )}
          </div>
          
          <div className="product-details">
            <div className="product-header">
              <h3 className="product-title">{product.title}</h3>
              <div className="product-meta">
                <div className="product-category">{product.category}</div>
                <div className="product-rating">
                  {renderStars(product.rating)}
                  <span className="review-count">({product.reviews})</span>
                </div>
              </div>
            </div>
            
            <div className="product-location">
              <i className="fas fa-map-marker-alt"></i>
              <span>{product.location}</span>
            </div>
            
            <p className="product-description">{product.description.substring(0, 80)}...</p>
            
            {isHovered && product.features && product.features.length > 0 && (
              <div className="product-features">
                <ul>
                  {product.features.slice(0, 2).map((feature, index) => (
                    <li key={index}><i className="fas fa-check"></i> {feature}</li>
                  ))}
                  {product.features.length > 2 && <li className="more-features">+ {product.features.length - 2} more</li>}
                </ul>
              </div>
            )}
            
            <div className="product-actions">
              <Link to={`/product/${product._id}`} className="view-details-btn">
                View Details
              </Link>
              <button
                className={`add-to-cart-btn ${addSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={product.availability !== "Available"}
                aria-label="Add to cart"
              >
                <i className={addSuccess ? "fas fa-check" : "fas fa-shopping-cart"}></i>
                <span>{addSuccess ? "Added" : "Rent"}</span>
              </button>
            </div>
          </div>
        </Link>
        
        <button 
          className="wishlist-button"
          onClick={(e) => e.preventDefault()}
          aria-label="Add to wishlist"
        >
          <i className="far fa-heart"></i>
        </button>
        
        {showRentalOptions && (
          <div className="rental-options-overlay" onClick={handleCancelRental}>
            <div className="rental-options-container" onClick={(e) => e.stopPropagation()}>
              <h4>Select Rental Duration</h4>
              
              {product.minRentalDays && product.maxRentalDays && (
                <div className="rental-constraints">
                  <span>Available for {product.minRentalDays} to {product.maxRentalDays} days</span>
                </div>
              )}
              
              <div className="duration-options">
                {getDurationOptions().map(days => (
                  <button 
                    key={days}
                    className={`duration-option ${selectedDuration === days ? 'selected' : ''}`}
                    onClick={(e) => handleRentalSelect(e, days)}
                  >
                    {days} {days === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>
              <div className="rental-price">
                <span>Total: ${(product.price * selectedDuration).toFixed(2)}</span>
                <span className="price-per-day">(${product.price}/day × {selectedDuration} days)</span>
              </div>
              <div className="rental-actions">
                <button className="confirm-rental-btn" onClick={handleConfirmRental}>
                  Add to Cart
                </button>
                <button className="cancel-rental-btn" onClick={handleCancelRental}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
