import { Search, Bell, User, Plus } from "lucide-react"

export function RentedHeader() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="text-2xl font-bold text-green-500">
          RENTED<span className="text-green-500">•</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for items, services, or categories"
            className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="bg-green-500 text-white rounded-md px-4 py-2 flex items-center text-sm font-medium">
          <Plus size={16} className="mr-2" />
          List Item
        </button>
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </button>
        <button className="text-gray-700">
          <User size={20} />
        </button>
      </div>
    </header>
  )
}
