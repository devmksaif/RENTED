import "../styles/VerticalNavbar.css"
import {
  Home,
  Search,
  ShoppingCart,
  User,
  Package,
  Heart,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react"

function VerticalNavbar() {
  return (
    <nav className="vertical-navbar">
      <div className="navbar-header">
        <a href="/" className="logo-link">
          <h1 className="logo">
            RENTED<span className="logo-dot">•</span>
          </h1>
        </a>
      </div>

      <div className="navbar-search">
        <div className="search-container">
          <Search className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="navbar-links">
        <a href="#" className="nav-link">
          <Home className="nav-icon" />
          <span>Home</span>
        </a>
        <a href="#" className="nav-link">
          <Package className="nav-icon" />
          <span>Browse</span>
        </a>
        <a href="#" className="nav-link active">
          <ShoppingCart className="nav-icon" />
          <span>Cart</span>
          <span className="nav-badge">3</span>
        </a>
        <a href="#" className="nav-link">
          <Heart className="nav-icon" />
          <span>Wishlist</span>
        </a>
        <a href="#" className="nav-link">
          <Calendar className="nav-icon" />
          <span>Rentals</span>
        </a>
        <a href="#" className="nav-link">
          <MessageSquare className="nav-icon" />
          <span>Messages</span>
        </a>
      </div>

      <div className="navbar-footer">
        <a href="#" className="nav-link">
          <User className="nav-icon" />
          <span>Account</span>
        </a>
        <a href="#" className="nav-link">
          <Settings className="nav-icon" />
          <span>Settings</span>
        </a>
        <a href="#" className="nav-link">
          <HelpCircle className="nav-icon" />
          <span>Help</span>
        </a>
      </div>
    </nav>
  )
}

export default VerticalNavbar
