import React from 'react';
import '../styles/StaticPage.css';

function HelpCenter() {
  return (
    <div className="static-page-container">
      <h1>Help Center</h1>
      <p>Welcome to the RENTED Help Center. Find answers to frequently asked questions and guides on how to use our platform.</p>
      <h2>Popular Topics</h2>
      <ul>
        <li>Getting Started as a Renter</li>
        <li>Listing an Item for Rent</li>
        <li>Managing Your Bookings</li>
        <li>Payment and Pricing</li>
        <li>Safety and Trust</li>
      </ul>
      <p>Can't find what you're looking for? Contact our support team.</p>
    </div>
  );
}

export default HelpCenter; 