import { ChevronLeft, ChevronRight } from "lucide-react"

export function OrderInfo() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Order-12567</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Paid
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
              className="mr-1.5"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Unfulfilled
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button className="text-gray-700 font-medium text-sm">Report</button>
          <span className="text-gray-300">•</span>
          <button className="text-gray-700 font-medium text-sm">Duplicate</button>
          <span className="text-gray-300">•</span>
          <button className="text-gray-700 font-medium text-sm">Share Order</button>

          <div className="flex ml-4">
            <button className="p-1 border border-gray-200 rounded-l-md">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 border-t border-b border-gray-200">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <div className="flex items-center space-x-2">
          <span>Order date Apr 14, 2023</span>
          <span>•</span>
          <span>
            Order from{" "}
            <a href="#" className="text-gray-700 font-medium">
              Bagus Fikri
            </a>
          </span>
          <span>•</span>
          <span>Purchased via online store</span>
        </div>

        <div>
          <span>Order 12,567 out of 32,068</span>
        </div>
      </div>
    </div>
  )
}
