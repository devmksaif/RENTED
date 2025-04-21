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
import Link from "next/link"

export function VerticalNavbar() {
  return (
    <nav className="vertical-navbar">
      <div className="navbar-header">
        <Link href="/" className="logo-link">
          <h1 className="logo">
            RENTED<span className="logo-dot">•</span>
          </h1>
        </Link>
      </div>

      <div className="navbar-search">
        <div className="search-container">
          <Search className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="navbar-links">
        <Link href="#" className="nav-link">
          <Home className="nav-icon" />
          <span>Home</span>
        </Link>
        <Link href="#" className="nav-link">
          <Package className="nav-icon" />
          <span>Browse</span>
        </Link>
        <Link href="#" className="nav-link active">
          <ShoppingCart className="nav-icon" />
          <span>Cart</span>
          <span className="nav-badge">3</span>
        </Link>
        <Link href="#" className="nav-link">
          <Heart className="nav-icon" />
          <span>Wishlist</span>
        </Link>
        <Link href="#" className="nav-link">
          <Calendar className="nav-icon" />
          <span>Rentals</span>
        </Link>
        <Link href="#" className="nav-link">
          <MessageSquare className="nav-icon" />
          <span>Messages</span>
        </Link>
      </div>

      <div className="navbar-footer">
        <Link href="#" className="nav-link">
          <User className="nav-icon" />
          <span>Account</span>
        </Link>
        <Link href="#" className="nav-link">
          <Settings className="nav-icon" />
          <span>Settings</span>
        </Link>
        <Link href="#" className="nav-link">
          <HelpCircle className="nav-icon" />
          <span>Help</span>
        </Link>
      </div>
    </nav>
  )
}
