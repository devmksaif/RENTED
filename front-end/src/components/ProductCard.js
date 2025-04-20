import React from 'react';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
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
  
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || 'https://via.placeholder.com/300x200'} alt={product.title} />
        <div className="product-badge">${product.price}/day</div>
        <button className="wishlist-button">
          <i className="far fa-heart"></i>
        </button>
      </div>
      <div className="product-details">
        <div className="product-meta">
          <div className="product-category">{product.category}</div>
          <div className="product-rating">
            {renderStars(product.rating)}
            <span className="review-count">({product.reviews})</span>
          </div>
        </div>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-location">
            <i className="fas fa-map-marker-alt"></i>
            <span>{product.location}</span>
          </div>
          <button className="book-now-btn">Book Now</button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;