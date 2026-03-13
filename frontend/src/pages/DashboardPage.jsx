import { useState, useEffect } from "react"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  History,
  CheckCircle2
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { patientService, productService, saleService } from "@/services/api"

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    patients: [],
    products: [],
    sales: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [patRes, prodRes, saleRes] = await Promise.all([
        patientService.getAll(),
        productService.getAll(),
        saleService.getAll()
      ])
      setData({
        patients: patRes.data,
        products: prodRes.data,
        sales: saleRes.data
      })
    } catch (err) {
      console.error("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    patientCount: data.patients.length,
    productCount: data.products.length,
    salesCount: data.sales.length,
    revenue: data.sales.reduce((acc, s) => acc + s.total_amount, 0)
  }

  const lowStockItems = data.products
    .filter(p => p.stock_quantity < 20)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5)

  const recentSales = [...data.sales]
    .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
    .slice(0, 5)
    .map(sale => {
      const patient = data.patients.find(p => p.id === sale.patient_id)
      return {
        ...sale,
        patientName: patient?.name || "Unknown Patient",
        // Flatten item names for display
        itemsSummary: sale.items?.map(item => {
          const product = data.products.find(p => p.id === item.product_id)
          return product?.medicine_name || "Medicine"
        }).join(", ") || "Pharmacy Items"
      }
    })

  const statCards = [
    { title: "Total Patients", value: stats.patientCount, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
    { title: "Medicines in Stock", value: stats.productCount, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Live" },
    { title: "Total Sales", value: stats.salesCount, icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+25%" },
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10", trend: "+8%" },
  ]

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Gathering real-time intelligence...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinic Insights</h2>
          <p className="text-muted-foreground mt-1 text-sm">Real-time overview of medical and financial activity.</p>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 flex items-center gap-2">
          <Activity size={12} className="animate-pulse" /> Live System
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-all border-muted/20 group cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tabular-nums">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                {stat.trend.startsWith('+') ? <ArrowUpRight className="text-emerald-500" size={12} /> : <Activity className="text-muted-foreground" size={12} />}
                <span className={stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-muted-foreground'}>
                  {stat.trend} <span className="text-muted-foreground/60">historical</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History size={16} className="text-primary" /> Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentSales.map((sale) => (
                <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-xs text-primary">
                      {sale.patientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{sale.patientName}</p>
                      <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{sale.itemsSummary}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">₹{sale.total_amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="p-12 text-center text-xs text-muted-foreground italic">No sales recorded yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Low Stock Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {lowStockItems.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Package className="text-orange-500" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{product.medicine_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${product.stock_quantity < 5 ? 'text-destructive' : 'text-orange-600'}`}>
                      {product.stock_quantity} {product.unit || 'units'}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">In Stock</p>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="p-12 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  Inventory Healthy
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
