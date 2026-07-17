"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Bell,
  RefreshCw,
  LayoutGrid,
  Users,
  BookOpen,
  GraduationCap,
  FileText,
} from "lucide-react"
import Overview from "@/components/dashboard/overview"
import UsersComponent from "@/components/dashboard/users"
import Services from "@/components/dashboard/services"
import Batches from "@/components/dashboard/batches"
import { getStoredAuthData, API_BASE_URL } from "@/lib/utils"

type ActiveView = "overview" | "users" | "services" | "batches"

type DashboardData = {
  userStats: {
    total: number;
  };
  financialStats: {
    totalRevenue: number;
    recentPayments: Array<{
      _id: string;
      amount: number;
      status: string;
      paymentDate?: string;
      createdAt: string;
      updatedAt: string;
      paymentMethod: string;
      merchantOrderId: string;
      transactionId: string;
      failureReason?: string;
      userId: {
        _id: string;
        email: string;
      };
    }>;
  };
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const tab = searchParams.get("tab")
    return (tab as ActiveView) || "overview"
  })
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  // Check for auth token and redirect if not found
  useEffect(() => {
    const { tokens } = getStoredAuthData();
    if (!tokens?.accessToken) {
      router.replace('/')
      return
    }
  }, [router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get the stored auth data using the utility function
        const { tokens } = getStoredAuthData();
        
        if (!tokens?.accessToken) {
          console.error('No access token found')
          router.replace('/')
          return
        }

        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch dashboard data')
        }

        if (data.success) {
          setDashboardData(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          })
        }
      }
    }

    fetchDashboardData()
  }, [router])

  // Listen for popstate (back/forward) events
  useEffect(() => {
    const handlePopState = () => {
      // When going back/forward, update the active view based on URL
      const tab = new URLSearchParams(window.location.search).get("tab")
      setActiveView((tab as ActiveView) || "overview")
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navItems = [
    { name: "Overview", icon: LayoutGrid, view: "overview" as ActiveView },
    { name: "Users", icon: Users, view: "users" as ActiveView },
    { name: "Services", icon: BookOpen, view: "services" as ActiveView },
    { name: "Batches", icon: GraduationCap, view: "batches" as ActiveView },
  ]

  const handleTabChange = (view: ActiveView) => {
    setActiveView(view)
    // Use replaceState instead of push to avoid creating history entries
    const url = view === "overview" ? "/dashboard" : `/dashboard?tab=${view}`
    window.history.replaceState({}, "", url)
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return <Overview dashboardData={dashboardData} />
      case "users":
        return <UsersComponent />
      case "services":
        return <Services />
      case "batches":
        return <Batches />
      default:
        return <div>Coming Soon</div>
    }
  }

  // Return null while checking authentication to prevent flash of content
  if (!getStoredAuthData()?.tokens?.accessToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <div
        className={`${
          sidebarCollapsed ? "w-12" : "w-44"
        } bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 h-screen z-30`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2">
            {!sidebarCollapsed && (
              <Image
                src="/logo/swrzee-logo.png"
                alt="Swrzee Logo"
                width={100}
                height={30}
                priority
              />
            )}
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleTabChange(item.view)}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeView === item.view
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content - Adjusted with margin/padding for fixed sidebar */}
      <div className={`${sidebarCollapsed ? "ml-12" : "ml-44"} transition-all duration-300`}>
        {/* Top Navigation - Fixed */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-0 z-20" style={{ marginLeft: sidebarCollapsed ? '3rem' : '11rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700">Swrzee Enterprise</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content - Adjusted with padding for fixed header */}
        <main className="pt-24 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}
