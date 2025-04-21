"use client"

import {
  Home,
  BarChart2,
  FileText,
  Grid,
  Calendar,
  Users,
  MessageSquare,
  Mail,
  Clock,
  Bell,
  Settings,
  LayoutGrid,
  Menu,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const sidebarItems = [
    { id: "home", icon: <Home size={20} /> },
    { id: "analytics", icon: <BarChart2 size={20} /> },
    { id: "orders", icon: <FileText size={20} />, badge: 12 },
    { id: "products", icon: <Grid size={20} /> },
    { id: "calendar", icon: <Calendar size={20} /> },
    { id: "customers", icon: <Users size={20} /> },
    { id: "messages", icon: <MessageSquare size={20} /> },
    { id: "mail", icon: <Mail size={20} /> },
    { id: "time", icon: <Clock size={20} /> },
    { id: "notifications", icon: <Bell size={20} /> },
  ]

  const bottomItems = [
    { id: "settings", icon: <Settings size={20} /> },
    { id: "apps", icon: <LayoutGrid size={20} /> },
    { id: "menu", icon: <Menu size={20} /> },
  ]

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="mb-6">
        <div className="w-8 h-8 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF5722" />
            <path
              d="M2 17L12 22L22 17M2 12L12 17L22 12"
              stroke="#FF5722"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="mb-4">
        <button className="w-10 h-10 bg-orange-500 rounded-lg text-white flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center space-y-6 overflow-y-auto w-full">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${
              activeTab === item.id ? "text-orange-500" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center space-y-6 pt-6">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeTab === item.id ? "text-orange-500" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
