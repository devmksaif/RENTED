import { useState, useEffect } from "react"
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
  Menu,
  X,
} from "lucide-react"

function VerticalNavbar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isManuallyToggled, setIsManuallyToggled] = useState(false)

  // Add/remove body class when navbar is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('navbar-open')
    } else {
      document.body.classList.remove('navbar-open')
    }
    
    return () => {
      document.body.classList.remove('navbar-open')
    }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll handling if manually toggled
      if (isManuallyToggled) return
      
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at the top
        setIsVisible(false)
      } else {
        // Scrolling up or at the top
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, isManuallyToggled])

  const toggleNavbar = () => {
    const newOpenState = !isOpen
    setIsOpen(newOpenState)
    
    if (newOpenState) {
      // Opening the navbar
      setIsVisible(true)
      setIsManuallyToggled(true)
    } else {
      // Closing the navbar
      setIsVisible(false)
      // Reset manual toggle after a delay to allow animation to complete
      setTimeout(() => {
        setIsManuallyToggled(false)
      }, 300)
    }
  }

  return (
    <>
      <button 
        className={`navbar-toggle ${isOpen ? 'open' : ''}`} 
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav className={`vertical-navbar ${isOpen ? 'open' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
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
    </>
  )
}

export default VerticalNavbar
