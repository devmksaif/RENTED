"use client"
import { BrowserHeader } from "@/components/browser-header"
import { RentedHeader } from "@/components/rented-header"
import { OrderDetails } from "@/components/order-details"

export default function RentedOrderDetails() {
  return (
    <div className="flex flex-col w-full">
      <BrowserHeader />
      <RentedHeader />
      <div className="p-6 flex-1 overflow-auto">
        <OrderDetails />
      </div>
    </div>
  )
}
