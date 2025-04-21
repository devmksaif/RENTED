"use client"
import { VerticalNavbar } from "@/components/vertical-navbar"
import { OrderContent } from "@/components/order-content"

export default function OrderDetails() {
  return (
    <div className="app-container">
      <VerticalNavbar />
      <div className="main-content">
        <OrderContent />
      </div>
    </div>
  )
}
