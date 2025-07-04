import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBookingById, cancelBooking } from "../services/api";
import "../styles/BookingDetail.css";

// Define the global callback function for Google Maps API
// This function must be defined before the API script is loaded
window.initMap = () => {
  // This is just a placeholder or initial entry point.
  // The actual map initialization logic should be within the component
  // and triggered by the component's state/props.
  console.log('Google Maps API script loaded. Global initMap called.');
  // A custom event can be dispatched here if needed, or rely on the component's useEffect
};

function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Separate the map initialization logic into a useCallback hook
  const initializeMap = useCallback(() => {
    // Ensure the map container exists and Google Maps API is available
    if (!mapRef.current || typeof window.google === 'undefined' || !window.google.maps || !booking || !booking.meetingArea) {
      console.warn('Map initialization requirements not met.', {mapRef: mapRef.current, google: typeof window.google, booking: booking});
      return;
    }

    try {
      const location = {
        lat: booking.meetingArea.latitude,
        lng: booking.meetingArea.longitude,
      };

      console.log('Initializing Google Map with location:', location);

      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      });

      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        animation: window.google.maps.Animation.DROP,
        title: booking.meetingArea.name,
      });

      markerRef.current = marker;

      // Add info window with location name
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 5px;"><strong>${booking.meetingArea.name}</strong></div>`,
      });

      infoWindow.open(map, marker);

      console.log('Map successfully initialized.');
      // You might set a state here if needed, e.g., setMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      // setError("Failed to load map. Please try again."); // Avoid setting error here if it's just a map issue
    }
  }, [booking]); // Dependency on booking

  useEffect(() => {
    // Fetch booking details when the component mounts or id changes
    const fetchBookingDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getBookingById(id);
        setBooking(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  useEffect(() => {
    // Load Google Maps script if not already loaded and we have booking data
    if (booking && booking.meetingArea && !mapLoaded && typeof window.google === 'undefined') {
      console.log('Loading Google Maps script...');
      const googleMapsScript = document.createElement("script");
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"
      }&libraries=places&callback=initMap`; // Use the global initMap callback
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      
      document.head.appendChild(googleMapsScript);

      googleMapsScript.onload = () => {
         // Mark API as loaded after script loads
         console.log('Google Maps script loaded.');
         setMapLoaded(true);
      };
      
      googleMapsScript.onerror = (e) => {
        console.error('Google Maps script failed to load:', e);
        setError('Failed to load the map service.');
      };

      return () => {
        // Clean up the script on component unmount if it was added by this effect
         if (document.head.contains(googleMapsScript)) {
             document.head.removeChild(googleMapsScript);
         }
         // Do not delete window.initMap here if other components might use it
         // delete window.initMap;
      };
    } else if (booking && booking.meetingArea && typeof window.google !== 'undefined' && !mapLoaded) { // API is already loaded but not marked as loaded in state
       console.log('Google Maps API already loaded.');
       setMapLoaded(true);
    }
  }, [booking, mapLoaded]); // Dependencies
  
  // Effect to initialize the map itself once the API script is loaded and booking data is available
  useEffect(() => {
      if (mapLoaded && booking && booking.meetingArea && mapRef.current) {
         console.log('Map API loaded and booking data available. Initializing map component.');
         initializeMap();
      }
  }, [mapLoaded, booking, initializeMap]); // Dependencies on mapLoaded, booking data, and the memoized initializeMap

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Confirmed":
        return "status-confirmed";
      case "Completed":
        return "status-completed";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        setCancelLoading(true);
        await cancelBooking(id);
        setBooking((prev) => ({
          ...prev,
          status: "Cancelled",
        }));
        alert("Booking has been successfully cancelled.");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        setError("Failed to cancel booking. Please try again.", error);
      } finally {
        setCancelLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <p className="error-message">{error}</p>
        <Link to="/bookings" className="back-button">
          Back to Bookings
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="not-found-container">
        <div className="not-found-icon">
          <i className="fas fa-search"></i>
        </div>
        <h2>Booking Not Found</h2>
        <p>The booking you're looking for doesn't exist or has been removed.</p>
        <Link to="/bookings" className="back-button">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const rentalDuration = Math.ceil(
    (new Date(booking.endDate) - new Date(booking.startDate)) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="booking-detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> /<Link to="/bookings">My Bookings</Link> /
        <span>Booking #{booking._id.substring(0, 8)}</span>
      </div>

      <div className="booking-detail-content">
        <div className="booking-header">
          <h1>Booking Details</h1>
          <div className={`booking-status ${getStatusClass(booking.status)}`}>
            {booking.status}
          </div>
        </div>

        <div className="booking-info-grid">
          <div className="booking-product-info">
            <div className="product-image">
              <img
                src={
                  booking.product.image ||
                  booking.product.images?.[0] ||
                  "https://via.placeholder.com/300"
                }
                alt={booking.product.title}
              />
            </div>
            <div className="product-details">
              <h2>{booking.product.title}</h2>
              <div className="product-meta">
                <div className="product-category">
                  <i className="fas fa-tag"></i> {Array.isArray(booking.product.category) ? booking.product.category.join(', ') : booking.product.category}
                </div>
                <div className="product-location">
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {booking.product.location}
                </div>
              </div>
              <Link
                to={`/product/${booking.product._id}`}
                className="view-product-btn"
              >
                View Product Details
              </Link>
            </div>
          </div>

          <div className="booking-details-section">
            <h3>Booking Information</h3>
            <div className="booking-info-row">
              <div className="info-label">Booking ID:</div>
              <div className="info-value">{booking._id}</div>
            </div>
            <div className="booking-info-row">
              <div className="info-label">Booking Date:</div>
              <div className="info-value">{formatDate(booking.createdAt)}</div>
            </div>
            <div className="booking-info-row">
              <div className="info-label">Rental Period:</div>
              <div className="info-value">
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}{" "}
                ({rentalDuration} days)
              </div>
            </div>
            <div className="booking-info-row">
              <div className="info-label">Quantity:</div>
              <div className="info-value">{booking.quantity}</div>
            </div>
            <div className="booking-info-row">
              <div className="info-label">Payment Status:</div>
              <div
                className={`info-value payment-${booking.paymentStatus.toLowerCase()}`}
              >
                {booking.paymentStatus}
              </div>
            </div>
            {booking.paymentMethod && (
              <div className="booking-info-row">
                <div className="info-label">Payment Method:</div>
                <div className="info-value">
                  {booking.paymentMethod
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            )}
            {booking.shippingAddress && (
              <div className="booking-info-row">
                <div className="info-label">Shipping Address:</div>
                <div className="info-value">{booking.shippingAddress}</div>
              </div>
            )}
          </div>

          <div className="price-summary">
            <h3>Price Summary</h3>
            <div className="price-row">
              <span>Daily Rate:</span>
              <span>${booking.product.price?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="price-row">
              <span>Rental Duration:</span>
              <span>{rentalDuration} days</span>
            </div>
            <div className="price-row">
              <span>Quantity:</span>
              <span>{booking.quantity}</span>
            </div>
            {booking.product.serviceFee > 0 && (
              <div className="price-row">
                <span>Service Fee:</span>
                <span>${booking.product.serviceFee.toFixed(2)}</span>
              </div>
            )}
            {booking.product.deposit > 0 && (
              <div className="price-row">
                <span>Security Deposit (Refundable):</span>
                <span>${booking.product.deposit.toFixed(2)}</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total:</span>
              <span>${booking.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {booking.status === "Pending" || booking.status === "Confirmed" ? (
            <div className="booking-actions">
              <button
                className="cancel-booking-btn"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <div className="button-spinner"></div> Cancelling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i> Cancel Booking
                  </>
                )}
              </button>
              
              <Link to="/bookings" className="back-to-bookings-btn">
                <i className="fas fa-arrow-left"></i> Back to Bookings
              </Link>
            </div>
          ) : (
            <div className="booking-actions">
              <Link to="/bookings" className="back-to-bookings-btn">
                <i className="fas fa-arrow-left"></i> Back to Bookings
              </Link>
            </div>
          )}

          {booking.meetingArea && (
            <div className="meeting-area-section">
              <h3>Meeting Location</h3>
              <div className="meeting-area-name">
                <i className="fas fa-map-marker-alt"></i>
                <span>{booking.meetingArea.name}</span>
              </div>
              <div
                ref={mapRef}
                className="meeting-area-map"
                style={{
                  height: "250px",
                  marginTop: "1rem",
                  borderRadius: "8px",
                }}
              ></div>
              <div className="meeting-area-actions">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${booking.meetingArea.latitude},${booking.meetingArea.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="get-directions-btn"
                >
                  <i className="fas fa-directions"></i> Get Directions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingDetail;
