import { ChevronLeft, CreditCard, Truck, Calendar, Shield, AlertCircle } from "lucide-react"
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
                    </div>
                    <div className="item-price">
                      <span className="price">$129.99</span>
                      <span className="price-period">/week</span>
                    </div>
                  </div>
                </div>

                <div className="promo-code">
                  <input type="text" placeholder="Enter promo code" className="promo-input" />
                  <button className="promo-button">Apply</button>
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
                    <span className="total-label">Delivery Fee</span>
                    <span className="total-value">$15.00</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Tax</span>
                    <span className="total-value">$21.99</span>
                  </div>
                  <div className="total-row grand-total">
                    <span className="total-label">Total</span>
                    <span className="total-value">$756.97</span>
                  </div>
                </div>
              </div>

              <div className="order-details-section">
                <div className="shipping-info">
                  <div className="section-header">
                    <h2 className="section-title">Shipping Information</h2>
                    <a href="#" className="edit-link">Edit</a>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">
                      <Truck size={20} />
                    </div>
                    <div className="info-content">
                      <h3 className="info-name">Alex Johnson</h3>
                      <p className="info-address">123 Main Street, Apt 4B</p>
                      <p className="info-address">New York, NY 10001</p>
                      <p className="info-contact">+1 (555) 123-4567</p>
                      <div className="delivery-option">
                        <span className="delivery-label">Delivery Method:</span>
                        <span className="delivery-value">Standard Delivery (2-3 business days)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="payment-info">
                  <div className="section-header">
                    <h2 className="section-title">Payment Method</h2>
                    <a href="#" className="edit-link">Edit</a>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">
                      <CreditCard size={20} />
                    </div>
                    <div className="info-content">
                      <h3 className="payment-method">Visa ending in 4242</h3>
                      <p className="payment-expiry">Expires 05/2026</p>
                      <p className="billing-address">Billing address same as shipping</p>
                    </div>
                  </div>
                </div>

                <div className="rental-protection">
                  <div className="protection-header">
                    <Shield size={20} />
                    <h2 className="protection-title">Rental Protection Plan</h2>
                  </div>
                  <p className="protection-description">
                    Add protection for accidental damage, spills, and more for just $29.99.
                  </p>
                  <div className="protection-options">
                    <label className="protection-option">
                      <input type="radio" name="protection" value="yes" defaultChecked />
                      <span className="option-text">Yes, add protection ($29.99)</span>
                    </label>
                    <label className="protection-option">
                      <input type="radio" name="protection" value="no" />
                      <span className="option-text">No, I'll be responsible for any damages</span>
                    </label>
                  </div>
                </div>

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
                  <button className="primary-button">Confirm Order</button>
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
