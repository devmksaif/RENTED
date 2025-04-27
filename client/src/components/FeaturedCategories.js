import React from 'react';
import '../styles/FeaturedCategories.css';

function FeaturedCategories({ onCategorySelect }) {
  const categories = [
    { id: 1, name: 'Electronics', icon: 'fas fa-laptop' },
    { id: 2, name: 'Furniture', icon: 'fas fa-couch' },
    { id: 3, name: 'Tools', icon: 'fas fa-tools' },
    { id: 4, name: 'Vehicles', icon: 'fas fa-car' },
    { id: 5, name: 'Clothing', icon: 'fas fa-tshirt' },
    { id: 6, name: 'Sports', icon: 'fas fa-basketball-ball' }
  ];

  return (
    <div className="featured-categories">
      <h2 className="section-title">Browse by Category</h2>
      <div className="categories-grid">
        {categories.map(category => (
          <div 
            key={category.id} 
            className="category-card"
            onClick={() => onCategorySelect(category.name)}
          >
            <div className="category-icon">
              <i className={category.icon}></i>
            </div>
            <div className="category-name">{category.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedCategories;