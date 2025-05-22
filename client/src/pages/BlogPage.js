import React from 'react';
import '../styles/StaticPage.css';

function BlogPage() {
  return (
    <div className="static-page-container">
      <h1>RENTED Blog</h1>
      <p>Welcome to the RENTED blog! Here you'll find articles, tips, and stories about renting, sustainability, and our community.</p>
      <h2>Latest Posts</h2>
      <ul>
        <li><a href="#">5 Creative Ways to Use Rented Items for Your Next Project</a></li>
        <li><a href="#">The Environmental Benefits of Choosing to Rent</a></li>
        <li><a href="#">How to Become a Successful Lender on RENTED</a></li>
        <li><a href="#">Community Spotlight: [Featured User]</a></li>
      </ul>
      <p>Stay tuned for more updates!</p>
    </div>
  );
}

export default BlogPage; 