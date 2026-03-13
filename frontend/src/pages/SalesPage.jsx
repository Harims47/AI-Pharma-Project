import { useState, useEffect } from "react"
import { ShoppingBag, Plus, Trash2, Search, CreditCard, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { patientService, productService, saleService } from "@/services/api"

const SalesPage = () => {
  const [patients, setPatients] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [patRes, prodRes] = await Promise.all([
        patientService.getAll(),
        productService.getAll()
      ])
      setPatients(patRes.data)
      setProducts(prodRes.data)
    } catch (err) {
      console.error("Failed to fetch data")
    }
  }

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      alert("Out of stock!")
      return
    }
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        alert("Insufficient stock!")
        return
      }
      setCart(cart.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        medicine_name: product.medicine_name, 
        quantity: 1, 
        price: product.selling_price 
      }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const handleCheckout = async () => {
    if (!selectedPatient || cart.length === 0) {
      alert("Please select a patient and add items to cart")
      return
    }

    try {
      await saleService.create({
        patient_id: parseInt(selectedPatient),
        total_amount: totalAmount,
        payment_mode: paymentMode,
        items: cart.map(({ product_id, quantity, price }) => ({ product_id, quantity, price }))
      })
      alert("Sale successful!")
      setCart([])
      setSelectedPatient("")
      fetchData() // Refresh stock
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.detail || "Unknown error"))
    }
  }

  return (
    <div className="flex gap-8 h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Product Selection List */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-muted/20 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search medicine..." 
              className="pl-10 border-none shadow-none focus-visible:ring-0 bg-transparent" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
          {products.filter(p => p.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
            <Card 
              key={product.id} 
              className="hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm truncate pr-2">{product.medicine_name}</div>
                  <div className="text-xs font-black text-primary">₹{product.selling_price}</div>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.category}</div>
                <div className="flex justify-between items-center pt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${product.stock_quantity < 10 ? 'bg-orange-100 text-orange-700' : 'bg-secondary'}`}>
                    Stock: {product.stock_quantity}
                  </span>
                  <Plus size={14} className="text-muted-foreground group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart and Checkout Section */}
      <Card className="w-[400px] border-muted/20 shadow-xl flex flex-col h-full bg-card">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Current Bill
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Patient</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Items</label>
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.medicine_name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} x ₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">₹{item.quantity * item.price}</span>
                    <Button 
                      variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-xs text-muted-foreground italic py-8 border-2 border-dashed rounded-lg">Cart is empty</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4 border-t p-6 bg-muted/10">
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total Payable</span>
              <span className="text-2xl font-black text-primary">₹{totalAmount}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2">
            <Button 
              variant={paymentMode === "Cash" ? "default" : "outline"} 
              className="gap-2 h-10"
              onClick={() => setPaymentMode("Cash")}
            >
              <Banknote size={16} /> Cash
            </Button>
            <Button 
              variant={paymentMode === "GPay" ? "default" : "outline"} 
              className="gap-2 h-10"
              onClick={() => setPaymentMode("GPay")}
            >
              <CreditCard size={16} /> Digital
            </Button>
          </div>

          <Button 
            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Complete Transaction
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SalesPage
