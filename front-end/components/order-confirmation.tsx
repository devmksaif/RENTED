"use client"
import { VerticalNavbar } from "@/components/vertical-navbar"
import { ConfirmationContent } from "@/components/confirmation-content"
import { Footer } from "@/components/footer"

export default function OrderConfirmation() {
  return (
    <div className="app-container">
      <VerticalNavbar />
      <div className="main-wrapper">
        <div className="main-content">
          <ConfirmationContent />
        </div>
        <Footer />
      </div>
    </div>
  )
}
