import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { saveCart } from "../services/api"; // Add this import
import { getProductById } from "../services/api"; // Add this import
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
  const imageRef = useRef(null);

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
        console.error("Error fetching product:", error);
        setError("Failed to load product details. Please try again.");
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

      // Validate rental duration against min/max
      const minDays = product.minRentalDays || 1;
      const maxDays = product.maxRentalDays || 30;

      if (rentalDuration < minDays || rentalDuration > maxDays) {
        setDateError(
          `Rental period must be between ${minDays} and ${maxDays} days`
        );
        return;
      }

      // Calculate total price
      const totalPrice = product.price * quantity * rentalDuration;

      // Add to cart either through parent component or directly
      if (onAddToCart) {
        await onAddToCart(
          product,
          rentalDuration,
          quantity,
          startDate,
          endDate
        );
      } else {
        await saveCart({
          productId: product._id,
          quantity: quantity,
          duration: rentalDuration,
          startDate: startDate,
          endDate: endDate,
          totalPrice: totalPrice,
        });
      }

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
            <h3>Book Now</h3>

            {product.minRentalDays && product.maxRentalDays && (
              <div className="rental-constraints">
                <i className="fas fa-info-circle"></i>
                <span>
                  Rental period: {product.minRentalDays} to{" "}
                  {product.maxRentalDays} days
                </span>
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
                  min={new Date().toISOString().split("T")[0]}
                  max={maxDate.toISOString().split("T")[0]}
                  required
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">End Date</label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  max={maxDate.toISOString().split("T")[0]}
                  required
                  className="date-input"
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
                  <span>
                    {formatDate(startDate)} - {formatDate(endDate)} (
                    {rentalDuration} days)
                  </span>
                </div>
                <div className="rental-calculation">
                  <div className="calc-row">
                    <span>
                      ${product.price} × {quantity}{" "}
                      {quantity > 1 ? "items" : "item"} × {rentalDuration} days
                    </span>
                    <span>
                      ${(product.price * quantity * rentalDuration).toFixed(2)}
                    </span>
                  </div>
                  {product.deposit > 0 && (
                    <div className="calc-row">
                      <span>Security Deposit (refundable)</span>
                      <span>${product.deposit.toFixed(2)}</span>
                    </div>
                  )}
                  {product.serviceFee > 0 && (
                    <div className="calc-row">
                      <span>Service Fee</span>
                      <span>${product.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="calc-row total">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        product.price * quantity * rentalDuration +
                        (product.deposit || 0) +
                        (product.serviceFee || 0)
                      ).toFixed(2)}
                    </span>
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
                  product?.availability !== "Available" ||
                  !startDate ||
                  !endDate ||
                  !!dateError
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

            {!startDate || !endDate ? (
              <div className="date-required-message">
                <i className="fas fa-info-circle"></i> Please select rental
                dates
              </div>
            ) : null}

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
                <div className="owner-name">Verified Owner</div>
                <div className="owner-rating">
                  <i className="fas fa-star"></i> 4.8 (120 rentals)
                </div>
                <div className="owner-response">
                  <i className="fas fa-clock"></i> Typically responds within 2
                  hours
                </div>
              </div>
              <button className="contact-owner-btn">
                <i className="fas fa-comment"></i> Contact
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
            <h3>Similar Products</h3>
            <div className="similar-products-placeholder">
              <p>Browse similar products in this category</p>
              <Link
                to={`/category/${product.category}`}
                className="browse-more"
              >
                View More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
