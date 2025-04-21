import { ArrowLeft, ArrowRight, RotateCcw, Lock, Bookmark, Share2, User, MoreVertical } from "lucide-react"

export function BrowserHeader() {
  return (
    <div className="bg-blue-50 border-b border-gray-200 py-2 px-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 px-2 py-1 rounded-md">
            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
              <span>w</span>
            </div>
            <span className="text-xs text-gray-700">Upwork</span>
            <span className="text-xs text-gray-500">×</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-1 rounded-md">
            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">
              <span>f</span>
            </div>
            <span className="text-xs text-gray-700 truncate max-w-[120px]">Fiverr | Freelance servi...</span>
            <span className="text-xs text-gray-500">×</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-1 rounded-md">
            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">
              <span>f</span>
            </div>
            <span className="text-xs text-gray-700 truncate max-w-[120px]">Freelance vetting & app...</span>
            <span className="text-xs text-gray-500">×</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-1 rounded-md">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
              <span>f</span>
            </div>
            <span className="text-xs text-gray-700">(2) Facebook</span>
            <span className="text-xs text-gray-500">×</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-1 rounded-md">
            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
              <span>w</span>
            </div>
            <span className="text-xs text-gray-700 truncate max-w-[120px]">Change Membership Pl...</span>
            <span className="text-xs text-gray-500">×</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-200 rounded-md">
            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
              <span>R</span>
            </div>
            <span className="text-xs text-gray-700 truncate max-w-[120px]">RENTED - Rent anythin...</span>
            <span className="text-xs text-gray-500">×</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="w-6 h-6 flex items-center justify-center text-gray-500">+</button>
          <button className="w-6 h-6 flex items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center mt-2">
        <button className="p-1 text-gray-500">
          <ArrowLeft size={16} />
        </button>
        <button className="p-1 text-gray-500">
          <ArrowRight size={16} />
        </button>
        <button className="p-1 text-gray-500">
          <RotateCcw size={16} />
        </button>

        <div className="flex items-center mx-2 bg-white rounded-md border border-gray-300 px-2 py-1 flex-1 max-w-md">
          <Lock size={14} className="text-gray-400 mr-2" />
          <span className="text-sm text-gray-700">localhost:3000</span>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-1 text-gray-500">
            <Bookmark size={16} />
          </button>
          <button className="p-1 text-gray-500">
            <Share2 size={16} />
          </button>
          <button className="p-1 text-gray-500">
            <User size={16} />
          </button>
          <button className="p-1 text-gray-500">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
