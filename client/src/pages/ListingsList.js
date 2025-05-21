import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserListings, deleteProduct } from '../services/api';
import '../styles/ListingsList.css';

function ListingsList() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view your listings');
      }
      
      const data = await getUserListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(error.message || 'Failed to load your listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteProduct(id);
        setListings(listings.filter(listing => listing._id !== id));
      } catch (error) {
        setError('Failed to delete listing. Please try again.');
      }
    }
  };

  const handleDeleteClick = (id) => {
    setListingToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(listingToDelete);
      setListings(listings.filter(listing => listing._id !== listingToDelete));
      setShowDeleteModal(false);
      setListingToDelete(null);
    } catch (error) {
      setError('Failed to delete listing. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setListingToDelete(null);
  };

  // Add filtering functionality
  const filteredListings = listings.filter(listing => {
    // Filter by availability status
    if (filter !== 'all' && listing.availability !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !listing.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="listings-loading">
        <div className="loading-spinner"></div>
        <p>Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1>My Listings</h1>
        <Link to="/listings/create" className="create-listing-btn">
          <i className="fas fa-plus"></i>
          Create New Listing
        </Link>
      </div>

      {error && <div className="listings-error">{error}</div>}

      {/* Add search and filter controls */}
      <div className="listings-controls">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search your listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <span className="filter-label">Filter by:</span>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
              onClick={() => setFilter('available')}
            >
              Available
            </button>
            <button 
              className={`filter-btn ${filter === 'rented' ? 'active' : ''}`}
              onClick={() => setFilter('rented')}
            >
              Rented
            </button>
          </div>
        </div>
      </div>

      {/* Show count of filtered listings */}
      <div className="listings-count">
        Showing {filteredListings.length} of {listings.length} listings
      </div>

      <div className="listings-grid">
        {filteredListings.length > 0 ? (
          filteredListings.map(listing => (
            <div key={listing._id} className="listing-card">
              <div className="listing-image">
                <img src={listing.image || 'https://via.placeholder.com/300x200'} alt={listing.title} />
                <div className="listing-status" data-status={listing.availability}>
                  {listing.availability}
                </div>
                <div className="listing-quick-actions">
                  <button 
                    onClick={() => handleDeleteClick(listing._id)} 
                    className="quick-action-btn delete-btn"
                    title="Delete listing"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                  <Link 
                    to={`/edit-listing/${listing._id}`} 
                    className="quick-action-btn edit-btn"
                    title="Edit listing"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                </div>
              </div>
              <div className="listing-content">
                <h3>{listing.title}</h3>
                <p className="listing-price">${listing.price}/day</p>
                <p className="listing-description">{listing.description.length > 100 
                  ? `${listing.description.substring(0, 100)}...` 
                  : listing.description}
                </p>
                <div className="listing-meta">
                  <span><i className="fas fa-map-marker-alt"></i> {listing.location}</span>
                  <span><i className="fas fa-tag"></i> {Array.isArray(listing.category) ? listing.category.join(', ') : listing.category}</span>
                </div>
                <Link to={`/product/${listing._id}`} className="view-listing-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-listings">
            <i className="fas fa-box-open"></i>
            <h2>No Listings Found</h2>
            {searchTerm || filter !== 'all' ? (
              <>
                <p>No listings match your current filters.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setFilter('all');}} 
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p>Start renting out your items by creating your first listing!</p>
                <Link to="/listings/create" className="create-first-listing-btn">
                  Create Your First Listing
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Confirm Deletion</h3>
              <button className="close-modal-btn" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="delete-modal-body">
              <i className="fas fa-exclamation-triangle warning-icon"></i>
              <p>Are you sure you want to delete this listing?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingsList;