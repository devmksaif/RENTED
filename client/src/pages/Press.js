import React from 'react';
import '../styles/StaticPage.css';

function Press() {
  return (
    <div className="static-page-container">
      <h1>Press & Media</h1>
      <p>Welcome to the RENTED press page. Here you can find our latest press releases, media mentions, and contact information for media inquiries.</p>
      <h2>Press Releases</h2>
      <ul>
        <li>[Date]: RENTED Announces Expansion into New Markets</li>
        <li>[Date]: RENTED Secures Funding to Enhance Platform Features</li>
        <li>[Date]: RENTED Partners with Local Organizations for Sustainability Initiative</li>
      </ul>
      <h2>Media Contact</h2>
      <p>For all media inquiries, please contact: media@rented.com</p>
    </div>
  );
}

export default Press; 