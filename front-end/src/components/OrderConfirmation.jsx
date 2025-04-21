import { ChevronLeft, Calendar, AlertCircle } from "lucide-react"
import VerticalNavbar from "./VerticalNavbar"
import Footer from "./Footer"
import "../styles/OrderConfirmation.css"

function OrderConfirmation() {
  return (
    <div className="app-container">
      <VerticalNavbar />
      <div className="main-wrapper">
        <div className="main-content">
          <div className="confirmation-container">
            <div className="confirmation-header">
              <a href="#" className="back-link">
                <ChevronLeft size={20} />
                <span>Back to Cart</span>
              </a>
              <h1 className="page-title">Review Your Order</h1>
              <p className="page-subtitle">Please review your order details before confirming your purchase.</p>
            </div>

            <div className="confirmation-content">
              <div className="order-summary-section">
                <div className="section-header">
                  <h2 className="section-title">Order Summary</h2>
                  <a href="#" className="edit-link">Edit Cart</a>
                </div>

                <div className="order-items">
                  <div className="order-item">
                    <div className="item-image">
                      <img src="https://via.placeholder.com/80" alt="Macbook Pro" />
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">Macbook Pro 14 Inch 512GB M1 Pro</h3>
                      <p className="item-option">Color: Space Gray</p>
                      <div className="rental-period">
                        <Calendar size={16} />
                        <span>May 15, 2025 - May 22, 2025 (7 days)</span>
                      </div>
                      <button className="primary-button">Confirm Rental</button>
                    </div>
                    <div className="item-price">
                      <span className="price">$89.99</span>
                      <span className="price-period">/week</span>
                    </div>
                  </div>

                  <div className="order-item">
                    <div className="item-image">
                      <img src="https://via.placeholder.com/80" alt="Pro Display XDR" />
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">APPLE 32" Pro Display XDR</h3>
                      <p className="item-option">Color: Silver</p>
                      <div className="rental-period">
                        <Calendar size={16} />
                        <span>May 15, 2025 - May 22, 2025 (7 days)</span>
                      </div>
                      <button className="primary-button">Confirm Rental</button>
                    </div>
                    <div className="item-price">
                      <span className="price">$129.99</span>
                      <span className="price-period">/week</span>
                    </div>
                  </div>
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span className="total-label">Subtotal</span>
                    <span className="total-value">$219.98</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Security Deposit (refundable)</span>
                    <span className="total-value">$500.00</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Tax</span>
                    <span className="total-value">$21.99</span>
                  </div>
                  <div className="total-row grand-total">
                    <span className="total-label">Total</span>
                    <span className="total-value">$741.97</span>
                  </div>
                </div>
              </div>

              <div className="order-details-section">
                <div className="terms-section">
                  <label className="terms-checkbox">
                    <input type="checkbox" defaultChecked />
                    <span className="checkbox-text">
                      I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Rental Agreement</a>
                    </span>
                  </label>
                </div>

                <div className="note-section">
                  <div className="note-header">
                    <AlertCircle size={16} />
                    <h3 className="note-title">Important Note</h3>
                  </div>
                  <p className="note-text">
                    Your security deposit will be refunded within 5 business days after the items are returned in their
                    original condition.
                  </p>
                </div>

                <div className="action-buttons">
                  <button className="secondary-button">Back to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default OrderConfirmation
