import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <div className="logo">
              <span className="logo-text">RENTED</span>
              <span className="logo-dot"></span>
            </div>
            <p className="footer-tagline">Rent anything you need, when you need it.</p>
          </div>
          
          <div className="footer-links-container">
            <div className="footer-links-column">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/press">Press</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="/help">Help Center</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/safety">Safety Center</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
                <li><a href="/guidelines">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-social">
            <a href="https://facebook.com" className="social-icon">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" className="social-icon">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
          
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} RENTED. All rights reserved.</p>
            <p className="footer-contact">Contact: email@example.com | 123-456-7890</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;