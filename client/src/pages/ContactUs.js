import React from 'react';
import '../styles/StaticPage.css';

function ContactUs() {
  return (
    <div className="static-page-container">
      <h1>Contact Us</h1>
      <p>Have a question, feedback, or need support? Get in touch with the RENTED team.</p>
      <p>You can reach us via:</p>
      <ul>
        <li>Email: support@rented.com</li>
        <li>Phone: +1 (123) 456-7890</li>
        <li>Address: [Your Company Address Here]</li>
      </ul>
      <p>Alternatively, you can use the contact form below:</p>
      {/* Add a simple form here if needed */}
      <form className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" rows="4"></textarea>
        </div>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default ContactUs; 