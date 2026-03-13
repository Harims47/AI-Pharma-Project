import { useState, useEffect } from "react"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { patientService, productService, saleService } from "@/services/api"

const DashboardPage = () => {
  const [stats, setStats] = useState({
    patients: 0,
    products: 0,
    salesCount: 0,
    revenue: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, products, sales] = await Promise.all([
          patientService.getAll(),
          productService.getAll(),
          saleService.getAll()
        ])
        
        setStats({
          patients: patients.data.length,
          products: products.data.length,
          salesCount: sales.data.length,
          revenue: sales.data.reduce((acc, sale) => acc + sale.total_amount, 0)
        })
      } catch (err) {
        console.error("Failed to fetch dashboard stats")
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: "Total Patients", value: stats.patients, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
    { title: "Medicines in Stock", value: stats.products, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Stable" },
    { title: "Total Sales", value: stats.salesCount, icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+25%" },
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10", trend: "+8%" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Quick summary of your clinic's activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={stat.color} size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend.startsWith('+') ? <ArrowUpRight className="text-emerald-500" size={14} /> : <Activity className="text-muted-foreground" size={14} />}
                <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {stat.trend} from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground italic">Paracetamol, Vitamin C</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹450.00</p>
                    <p className="text-xs text-muted-foreground">10 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Package className="text-orange-500" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amoxicillin 500mg</p>
                      <p className="text-xs text-muted-foreground">Manufacturer: GSK</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">12 units</p>
                    <p className="text-xs text-muted-foreground italic">Threshold: 20</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
