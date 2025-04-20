import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import ProductList from './components/ProductList';
import Filters from './components/Filters';
import Footer from './components/Footer';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: 50,
    location: '',
    availability: '',
    rating: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch products from backend
    fetchProducts();
  }, []);
  
  useEffect(() => {
    // Apply filters when filter state or search query changes
    applyFilters();
  }, [filters, products, searchQuery]);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Apply price filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => product.price <= filters.priceRange);
    }
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(product => 
        product.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply availability filter
    if (filters.availability) {
      filtered = filtered.filter(product => product.availability === filters.availability);
    }
    
    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(product => product.rating >= parseInt(filters.rating));
    }
    
    setFilteredProducts(filtered);
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      priceRange: 50,
      location: '',
      availability: '',
      rating: ''
    });
    setSearchQuery('');
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const handleCategorySelect = (category) => {
    setFilters({
      ...filters,
      category
    });
  };
  
  return (
    <div className="App">
      <Header />
      <Hero onSearch={handleSearch} />
      <div className="container">
        <FeaturedCategories onCategorySelect={handleCategorySelect} />
      </div>
      <div className="container">
        <div className="main-content">
          <Filters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onResetFilters={resetFilters} 
          />
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="product-container">
              {searchQuery && (
                <div className="search-results-header">
                  <h2>Search results for "{searchQuery}"</h2>
                  <button className="clear-search" onClick={() => setSearchQuery('')}>
                    Clear search
                  </button>
                </div>
              )}
              <ProductList products={filteredProducts} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
