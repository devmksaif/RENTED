import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
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
              <Link href="#" className="social-link">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="social-link">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="social-link">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="social-link">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3 className="column-title">Company</h3>
              <ul className="column-links">
                <li>
                  <Link href="#">About Us</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Press</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="column-title">Support</h3>
              <ul className="column-links">
                <li>
                  <Link href="#">Help Center</Link>
                </li>
                <li>
                  <Link href="#">FAQ</Link>
                </li>
                <li>
                  <Link href="#">Contact Us</Link>
                </li>
                <li>
                  <Link href="#">Safety Center</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="column-title">Legal</h3>
              <ul className="column-links">
                <li>
                  <Link href="#">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Cookie Policy</Link>
                </li>
                <li>
                  <Link href="#">Community Guidelines</Link>
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
