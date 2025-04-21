import { ChevronLeft, ChevronRight, Pencil, MessageSquare } from "lucide-react"
import Image from "next/image"

export function OrderContent() {
  return (
    <div className="order-container">
      <div className="order-header">
        <div className="order-title-section">
          <button className="back-button">
            <ChevronLeft size={20} />
          </button>
          <h1 className="order-title">Order-12567</h1>
          <span className="status-badge status-paid">
            <span className="status-dot"></span>
            Paid
          </span>
          <span className="status-badge status-unfulfilled">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="status-icon"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Unfulfilled
          </span>
        </div>

        <div className="order-actions">
          <button className="text-button">Report</button>
          <span className="separator">•</span>
          <button className="text-button">Duplicate</button>
          <span className="separator">•</span>
          <button className="text-button">Share Order</button>

          <div className="pagination">
            <button className="pagination-button">
              <ChevronLeft size={16} />
            </button>
            <button className="pagination-button">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="order-meta">
        <div className="order-meta-info">
          <span>Order date Apr 14, 2023</span>
          <span className="separator">•</span>
          <span>
            Order from{" "}
            <a href="#" className="customer-link">
              Bagus Fikri
            </a>
          </span>
          <span className="separator">•</span>
          <span>Purchased via online store</span>
        </div>

        <div className="order-number">
          <span>Order 12,567 out of 32,068</span>
        </div>
      </div>

      <div className="order-content">
        <div className="order-main">
          <div className="progress-card">
            <div className="return-info">
              <span className="text-label">Return to</span>
              <span className="text-value">RENTED Store</span>
              <span className="country-flag">🇺🇸 US, United State</span>
              <div className="spacer"></div>
              <span className="text-label">Estimated arrived at</span>
              <span className="text-value">1st to 3rd of February</span>
            </div>

            <div className="progress-tracker">
              <div className="progress-line"></div>

              <div className="progress-steps">
                <div className="progress-step completed">
                  <div className="step-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="step-label">Review order</span>
                </div>

                <div className="progress-step">
                  <div className="step-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <span className="step-label">Preparing order</span>
                </div>

                <div className="progress-step">
                  <div className="step-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <span className="step-label">Shipping</span>
                </div>

                <div className="progress-step">
                  <div className="step-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <span className="step-label">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="cancel-button">Cancel Order</button>
            <button className="shipping-button">
              Create Shipping Label
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="arrow-icon"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="products-section">
            <div className="section-header">
              <h2 className="section-title">Products</h2>
              <div className="status-indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="status-icon"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Unfulfilled
              </div>
            </div>

            <div className="product-list">
              <div className="product-card">
                <div className="product-image">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Macbook Pro"
                    width={80}
                    height={80}
                    className="image"
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">Macbook Pro 14 Inch 512GB M1 Pro</h3>
                  <p className="product-sku">SKU: Mac-1000</p>
                  <div className="product-meta">
                    <span>Grey</span>
                    <span className="separator">•</span>
                    <span>Quantity 1</span>
                  </div>
                </div>

                <div className="product-price">
                  <span>$1,659.25</span>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Apple Display"
                    width={80}
                    height={80}
                    className="image"
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">APPLE 32" R6KD Pro Display XDR MWPF2ID/A</h3>
                  <p className="product-sku">SKU: Mac-5006</p>
                  <div className="product-meta">
                    <span>Silver</span>
                    <span className="separator">•</span>
                    <span>Quantity 1</span>
                  </div>
                </div>

                <div className="product-price">
                  <span>$5,848.77</span>
                </div>
              </div>
            </div>

            <div className="reserved-item">
              <button className="reserved-button">Reserved Item</button>
            </div>
          </div>

          <div className="payment-section">
            <h2 className="section-title">Payment Details</h2>

            <div className="payment-card">
              <div className="payment-row">
                <span className="payment-label">Payment Method</span>
                <div className="payment-value">
                  <span className="payment-method">VISA</span>
                  <span className="payment-number">#3634</span>
                  <span className="status-badge status-paid small">
                    <span className="status-dot"></span>
                    Paid
                  </span>
                </div>
              </div>

              <div className="payment-row">
                <span className="payment-label">Subtotal</span>
                <div className="payment-value">
                  <span className="payment-items">2 items</span>
                  <span className="payment-amount">$7,508.02</span>
                </div>
              </div>

              <div className="payment-row">
                <span className="payment-label">Shipping Type</span>
                <div className="payment-value shipping-details">
                  <p>The customer selected Free shipping</p>
                  <p className="shipping-note">($0.00) at checkout</p>
                </div>
              </div>

              <div className="payment-row">
                <span className="payment-label">Shipping Fee</span>
                <span className="payment-amount">$20.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-sidebar">
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Order Note</h3>
              <button className="edit-button">
                <Pencil size={16} />
              </button>
            </div>
            <p className="card-content">
              Please wrap the box with a wrapper, so the text is unreadable, this is for birthday present
            </p>
          </div>

          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Customer</h3>
              <button className="message-button">
                <MessageSquare size={16} />
              </button>
            </div>

            <div className="customer-info">
              <div className="customer-avatar">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="Customer"
                  width={40}
                  height={40}
                  className="avatar-image"
                />
              </div>

              <div className="customer-details">
                <h4 className="customer-name">Bagus Fikri</h4>
                <p className="customer-orders">Total: 2 order</p>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Shipping Address</h3>
              <button className="edit-button">
                <Pencil size={16} />
              </button>
            </div>

            <div className="address-info">
              <div className="address-map">
                <Image
                  src="/placeholder.svg?height=128&width=300"
                  alt="Map"
                  width={300}
                  height={128}
                  className="map-image"
                />
              </div>

              <div className="address-header">
                <h4 className="address-name">Bagus Fikri</h4>
                <a href="#" className="map-link">
                  View on Map
                </a>
              </div>

              <div className="address-details">
                <p>2118 Thornridge Cir, Syracuse,</p>
                <p>Connecticut 35624</p>
                <p>United State</p>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Contact Information</h3>
              <button className="edit-button">
                <Pencil size={16} />
              </button>
            </div>

            <div className="contact-info">
              <div className="contact-item">bagus.fikri@mail.com</div>
              <div className="contact-item">+(22)-789-907</div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="card-title">Tags</h3>
            <div className="tags-empty">No tags yet</div>
          </div>
        </div>
      </div>
    </div>
  )
}
