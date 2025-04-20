import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const categories = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Furniture', icon: '🛋️' },
    { name: 'Tools', icon: '🔧' },
    { name: 'Vehicles', icon: '🚗' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Sports', icon: '⚽' }
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Rent Anything You Need</h1>
          <p>Access thousands of items in your neighborhood</p>
          <div className="search-box">
            <input type="text" placeholder="What do you need?" />
            <button className="search-btn">Search</button>
          </div>
          <div className="popular-searches">
            <span>Popular:</span>
            <Link to="/search?q=cameras">Cameras</Link>
            <Link to="/search?q=bikes">Bikes</Link>
            <Link to="/search?q=tools">Tools</Link>
            <Link to="/search?q=furniture">Furniture</Link>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link to={`/category/${category.name.toLowerCase()}`} key={index} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="verification-banner">
        <div className="banner-content">
          <h2>Get Verified Today</h2>
          <p>Verified users get more rentals and build trust in the community</p>
          <Link to="/verify/id" className="btn btn-primary">Start Verification</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;