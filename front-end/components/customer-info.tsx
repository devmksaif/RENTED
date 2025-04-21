import { Pencil, MessageSquare } from "lucide-react"
import Image from "next/image"

export function CustomerInfo() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Order Note</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <Pencil size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Please wrap the box with a wrapper, so the text is unreadable, this is for birthday present
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Customer</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <MessageSquare size={16} />
          </button>
        </div>

        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Customer"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="ml-3">
            <h4 className="font-medium">Bagus Fikri</h4>
            <p className="text-sm text-gray-500">Total: 2 order</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Shipping Address</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <Pencil size={16} />
          </button>
        </div>

        <div className="mb-4">
          <div className="w-full h-32 bg-gray-100 rounded-md mb-2">
            <Image
              src="/placeholder.svg?height=128&width=300"
              alt="Map"
              width={300}
              height={128}
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          <div className="flex justify-between items-center">
            <h4 className="font-medium">Bagus Fikri</h4>
            <a href="#" className="text-sm text-gray-600">
              View on Map
            </a>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <p>2118 Thornridge Cir, Syracuse,</p>
            <p>Connecticut 35624</p>
            <p>United State</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Contact Information</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <Pencil size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="inline-block bg-gray-100 rounded-md px-3 py-1 text-sm">bagus.fikri@mail.com</div>
          <div className="inline-block bg-gray-100 rounded-md px-3 py-1 text-sm">+(22)-789-907</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Tags</h3>
        <div className="text-gray-400 text-sm">No tags yet</div>
      </div>
    </div>
  )
}
