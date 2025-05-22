import React from 'react';
import '../styles/StaticPage.css';

function FAQ() {
  return (
    <div className="static-page-container">
      <h1>Frequently Asked Questions</h1>
      <p>Here are some common questions about RENTED:</p>
      <div className="faq-item">
        <h3>What is RENTED?</h3>
        <p>RENTED is an online marketplace for peer-to-peer item rentals.</p>
      </div>
      <div className="faq-item">
        <h3>How do I list an item?</h3>
        <p>Create an account, go to your dashboard, and click "Create Listing".</p>
      </div>
      <div className="faq-item">
        <h3>How do payments work?</h3>
        <p>Payments are typically handled hand-to-hand upon item exchange, but this may vary based on listing.</p>
      </div>
      <p>For more questions, visit our Help Center or Contact Us.</p>
    </div>
  );
}

export default FAQ; 