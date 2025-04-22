import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../services/api';
import '../styles/CreateListing.css';

function CreateListing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    image: '',
    availability: 'Available'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createListing(formData);
      navigate('/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-listing-container">
      <div className="create-listing-header">
        <h1>Create New Listing</h1>
        <p>Rent out your items and start earning</p>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form className="create-listing-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your item in detail"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Tools & Equipment">Tools & Equipment</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price per day ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          <small>Provide a URL to an image of your item. Leave blank for a placeholder image.</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/listings')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              'Create Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateListing;