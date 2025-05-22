import React, { useState, useEffect, useRef } from "react";
import { useParams, Link,useNavigate } from "react-router-dom";
import { getUserById, saveCart } from "../services/api"; // Add this import
import { getProductById, sendMessage } from "../services/api"; // Add this import
import "../styles/ProductDetail.css";

function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [rentalDuration, setRentalDuration] = useState(7);
  const [dateError, setDateError] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [owner,setOwner] = useState({})
  const imageRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
         
        await getUserById(data?.owner).then(response => {setOwner(response); console.log(response)})
        // Set default rental duration to minRentalDays if available
        if (data.minRentalDays) {
          setRentalDuration(data.minRentalDays);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(()=>{
     
    
  },[])

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
          setDateError("");
          setRentalDuration(diffDays);
        }
      } else {
        setRentalDuration(diffDays || 1);
      }
    }
  }, [startDate, endDate, product]);

  // Handle end date update when rental duration changes via slider
  useEffect(() => {
    if (startDate && rentalDuration) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + parseInt(rentalDuration));
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [rentalDuration, startDate]);

  const handleAddToCart = async () => {
    if (!product) {
      setError("Product information is not available. Please try again.");
      return;
    }

    try {
      if (product.availability !== "Available") {
        setError("This product is not currently available for rent");
        return;
      }

      // Add to cart directly with default duration
      await saveCart({
        productId: product._id,
        quantity: quantity,
        duration: product.minRentalDays || 7,
      });

      // Clear any previous errors
      setError(null);
      setDateError("");

      // Show success message
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);

      // Dispatch custom event for cart update
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart. Please try again.");
    }
  };

  const handleImageZoom = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    // Here you would typically call an API to update the wishlist
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setRentalDuration(newDuration);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
        <div className="loading-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-price"></div>
          </div>
        </div>
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
  const handleContactOwner = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Navigate to MessageDetail with product owner ID
      if (product && product.owner) {
        // Create conversation or get existing one
        const response = await sendMessage(product.owner, `Hi, I'm interested in renting your ${product.title}`);
        
        // Navigate to the conversation
        if (response && response.conversationId) {
          navigate(`/messages/${response.conversationId}/${product.owner}`);
        } else {
          setError('Failed to start conversation. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error contacting owner:', error);
      setError('Failed to contact owner. Please try again.');
    }
  };

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
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "https://via.placeholder.com/600x400"];

  // Calculate available dates (for demo purposes)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 90); // Allow booking 90 days in advance

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> /
        <Link to={`/category/${product.category}`}>{product.category}</Link> /
        <span>{product.title}</span>
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          <div
            className={`main-image-container ${zoomed ? "zoomed" : ""}`}
            onMouseMove={zoomed ? handleImageZoom : null}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            <img
              ref={imageRef}
              src={productImages[activeImage]}
              alt={product.title}
              className="main-product-image"
              style={
                zoomed
                  ? {
                      transform: "scale(1.5)",
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />
            {product.featured && (
              <div className="featured-badge">
                <i className="fas fa-star"></i> Featured
              </div>
            )}
            {product.availability !== "Available" && (
              <div
                className={`availability-badge ${product.availability.toLowerCase()}`}
              >
                {product.availability}
              </div>
            )}
            <button
              className={`wishlist-button ${isInWishlist ? "active" : ""}`}
              onClick={toggleWishlist}
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <i className={`${isInWishlist ? "fas" : "far"} fa-heart`}></i>
            </button>
            {zoomed && (
              <div className="zoom-instructions">
                <i className="fas fa-search-plus"></i> Move cursor to zoom
              </div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="thumbnail-container">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
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
            {product.discount > 0 && (
              <div className="discount-badge">
                <i className="fas fa-tags"></i> Save {product.discount}%
              </div>
            )}
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
                  <li key={index}>
                    <i className="fas fa-check"></i> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="product-availability">
            <h3>Availability</h3>
            <div className="availability-status">
              <span
                className={`status-indicator ${product.availability.toLowerCase()}`}
              ></span>
              <span>{product.availability}</span>
            </div>
          </div>

          <div className="booking-form">
          
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
                  product?.availability !== "Available" 
                  
                }
              >
                <i className="fas fa-shopping-cart"></i> Add to Cart
              </button>
            </div>

            <div className="booking-options">
              <button className="request-booking">
                <i className="fas fa-calendar-check"></i> Request Booking
              </button>
              <button className="contact-owner">
                <i className="fas fa-comment"></i> Ask a Question
              </button>
            </div>
 

            {addedToCart && (
              <div className="added-to-cart-message">
                <i className="fas fa-check-circle"></i> Added to cart!{" "}
                <Link to="/cart" className="view-cart-link">
                  View Cart
                </Link>
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
                <div className="owner-name">{owner.name}</div>
                <div className="owner-rating">
                  <i className="fas fa-star"></i> {product.rating} {product.reviews}
                </div>
                <div className="owner-response">
                  <i className="fas fa-clock"></i> Typically responds within 2 hours
                </div>
              </div>
              
              <button
                onClick={handleContactOwner}
                className="contact-owner-btn"
              >
                Contact <i className="fas fa-comment"></i>
              </button>
            </div>
          </div>

          <div className="product-review-summary">
            <h3>Customer Reviews</h3>
            <div className="review-stats">
              <div className="average-rating">
                <span className="rating-large">
                  {product.rating.toFixed(1)}
                </span>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`${
                        star <= Math.round(product.rating) ? "fas" : "far"
                      } fa-star`}
                    ></i>
                  ))}
                </div>
                <span className="total-reviews">{product.reviews} reviews</span>
              </div>
              <Link to={`/product/${id}/reviews`} className="view-all-reviews">
                View all reviews <i className="fas fa-chevron-right"></i>
              </Link>
            </div>
          </div>

          <div className="similar-products">
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
