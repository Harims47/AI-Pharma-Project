import { useNavigate, useLocation, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  BarChart3, 
  Users, 
  Package, 
  Truck, 
  ShoppingCart, 
  ShoppingBag, 
  Ticket, 
  LogOut,
  LayoutDashboard,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Tokens", icon: Ticket, path: "/tokens" },
    { title: "Patients", icon: Users, path: "/patients" },
    { title: "Medicines", icon: Package, path: "/products" },
    { title: "Suppliers", icon: Truck, path: "/suppliers" },
    { title: "Purchases", icon: ShoppingCart, path: "/purchases" },
    { title: "Sales", icon: ShoppingBag, path: "/sales" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BarChart3 className="text-primary-foreground" size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Clinic CMS</h1>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              location.pathname === item.path 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon size={18} />
            {item.title}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t space-y-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-semibold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">Staff Member</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
