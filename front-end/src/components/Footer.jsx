import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import "../styles/Footer.css"

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">
              RENTED<span className="logo-dot">•</span>
            </h2>
            <p className="footer-tagline">Rent anything you need, when you need it.</p>
            <div className="social-links">
              <a href="#" className="social-link">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3 className="column-title">Company</h3>
              <ul className="column-links">
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="column-title">Support</h3>
              <ul className="column-links">
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">Safety Center</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="column-title">Legal</h3>
              <ul className="column-links">
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Cookie Policy</a>
                </li>
                <li>
                  <a href="#">Community Guidelines</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2025 RENTED. All rights reserved.</p>
          <p className="contact-info">Contact: support@rented.com | (555) 123-4567</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
