"use client";
import { Link } from "react-router-dom";
import { useState } from "react";
import { saveCart } from "../services/api";
import "../styles/ProductCard.css";

function ProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showRentalOptions, setShowRentalOptions] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(
    product.minRentalDays || 7
  );
  const [addSuccess, setAddSuccess] = useState(false);

  const getDurationOptions = () => {
    const minDays = product.minRentalDays || 1;
    const maxDays = product.maxRentalDays || 30;
    const options = [];

    const increment = maxDays > 14 ? 7 : 1;

    for (let i = minDays; i <= maxDays; i += increment) {
      options.push(i);
    }

    if (options[options.length - 1] !== maxDays) {
      options.push(maxDays);
    }

    return options;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (halfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
  };

  const handleRentalSelect = (e, duration) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDuration(duration);
  };

  const handleConfirmRental = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || product.availability !== "Available") {
      console.error("Product is not available for rent");
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
        console.error("Error adding to cart:", error);
      }
    } else {
      try {
        await saveCart({
          productId: product._id,
          quantity: 1,
          duration: selectedDuration,
        });

        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }

    window.dispatchEvent(new Event("cartUpdated"));
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

    const conditionClasses = {
      New: "pc-badge-condition-new",
      "Like New": "pc-badge-condition-like-new",
      Good: "pc-badge-condition-good",
      Fair: "pc-badge-condition-fair",
      Poor: "pc-badge-condition-poor",
    };

    return (
      <div
        className={`pc-badge pc-badge-condition ${
          conditionClasses[product.condition] || ""
        }`}
      >
        {product.condition}
      </div>
    );
  };

  return (
    <div
      className="pc-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!showRentalOptions) {
          setSelectedDuration(product.minRentalDays || 7);
        }
      }}
    >
      <div className="pc-inner">
        <Link to={`/product/${product._id}`} className="pc-link">
          <div className="pc-image-container">
            <img
              src={product.image || "https://via.placeholder.com/300x200"}
              alt={product.title}
              className={`pc-image ${isHovered ? "pc-image-zoom" : ""}`}
            />
            <div className="pc-price">
              ${product.price}
              <span className="pc-price-unit">/day</span>
            </div>

            {product.availability !== "Available" && (
              <div
                className={`pc-badge ${
                  product.availability === "Reserved"
                    ? "pc-badge-reserved"
                    : "pc-badge-availability"
                }`}
              >
                {product.availability}
              </div>
            )}
            {getConditionBadge()}
            {product.featured && (
              <div className="pc-badge pc-badge-featured">
                <i className="fas fa-star pc-badge-featured-icon"></i> Featured
              </div>
            )}
          </div>

          <div className="pc-details">
            <div className="pc-header">
              <h3 className="pc-title">{product.title}</h3>
              <div className="pc-meta">
                <div className="pc-category">
                  {Array.isArray(product.category) 
                    ? product.category.map((cat, index) => (
                        <span key={cat}>
                          {cat}
                          {index < product.category.length - 2
                            ? ', '
                            : index === product.category.length - 2
                              ? ' & '
                              : ''}
                        </span>
                      ))
                    : product.category}
                </div>
                <div className="pc-rating">
                  {renderStars(product.rating)}
                  <span className="pc-reviews">({product.reviews})</span>
                </div>
              </div>
            </div>

            <div className="pc-location">
              <i className="fas fa-map-marker-alt pc-location-icon"></i>
              <span>{product.location}</span>
            </div>

            <p className="pc-description">
              {product.description.substring(0, 80)}...
            </p>

            {isHovered && product.features && product.features.length > 0 && (
              <div className="pc-features">
                <ul className="pc-features-list">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="pc-feature-item">
                      <i className="fas fa-check pc-feature-icon"></i> {feature}
                    </li>
                  ))}
                  {product.features.length > 2 && (
                    <li className="pc-feature-more">
                      + {product.features.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="pc-actions">
              <Link to={`/product/${product._id}`} className="pc-view-details">
                View Details
              </Link>
              <button
                className={`pc-rent-button ${
                  addSuccess ? "pc-rent-button-success" : ""
                } ${
                  product.availability !== "Available"
                    ? "pc-rent-button-disabled"
                    : ""
                }`}
                onClick={handleAddToCart}
                disabled={product.availability !== "Available"}
                aria-label="Add to cart"
              >
                <i
                  className={`${
                    addSuccess ? "fas fa-check" : "fas fa-shopping-cart"
                  } pc-rent-icon`}
                ></i>
                <span>{addSuccess ? "Added" : "Rent"}</span>
              </button>
            </div>
          </div>
        </Link>

        <button
          className="pc-wishlist-button"
          onClick={(e) => e.preventDefault()}
          aria-label="Add to wishlist"
        >
          <i className="far fa-heart"></i>
        </button>

        {showRentalOptions && (
          <div className="pc-modal-overlay" onClick={handleCancelRental}>
            <div
              className="pc-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="pc-modal-title">Select Rental Duration</h4>

              {product.minRentalDays && product.maxRentalDays && (
                <div className="pc-rental-constraints">
                  <span>
                    Available for {product.minRentalDays} to{" "}
                    {product.maxRentalDays} days
                  </span>
                </div>
              )}

              <div className="pc-duration-options">
                {getDurationOptions().map((days) => (
                  <button
                    key={days}
                    className={`pc-duration-option ${
                      selectedDuration === days
                        ? "pc-duration-option-selected"
                        : ""
                    }`}
                    onClick={(e) => handleRentalSelect(e, days)}
                  >
                    {days} {days === 1 ? "day" : "days"}
                  </button>
                ))}
              </div>
              <div className="pc-rental-price">
                <div className="pc-rental-price-total">
                  Total: ${(product.price * selectedDuration).toFixed(2)}
                </div>
                <div className="pc-rental-price-breakdown">
                  (${product.price}/day × {selectedDuration} days)
                </div>
              </div>
              <div className="pc-rental-actions">
                <button
                  className="pc-confirm-button"
                  onClick={handleConfirmRental}
                >
                  Add to Cart
                </button>
                <button
                  className="pc-cancel-button"
                  onClick={handleCancelRental}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
