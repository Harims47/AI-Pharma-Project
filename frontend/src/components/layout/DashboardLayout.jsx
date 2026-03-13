import { Outlet, Navigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import { useAuth } from "@/context/AuthContext"

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
