import { useState, useEffect } from "react"
import { ShoppingBag, Plus, Minus, Trash2, Search, CreditCard, Banknote, AlertCircle } from "lucide-react"
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
import { SearchableSelect } from "@/components/ui/searchable-select"

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
      return
    }
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1)
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        medicine_name: product.medicine_name, 
        quantity: 1, 
        price: product.selling_price,
        max_stock: product.stock_quantity
      }])
    }
  }

  const updateQuantity = (productId, newQty) => {
    const product = products.find(p => p.id === productId)
    const qty = Math.max(1, Math.min(newQty, product?.stock_quantity || 1))
    
    setCart(cart.map(item => 
      item.product_id === productId ? { ...item, quantity: qty } : item
    ))
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
      fetchData() 
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.detail || "Unknown error"))
    }
  }

  const filteredProducts = products.filter(p => 
    p.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex gap-8 h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Product Selection List */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Point of Sale</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <Input 
              placeholder="Search by medicine name or category (e.g. Paracetamol, Tablet)..." 
              className="pl-10 h-12 text-lg border-muted/20 shadow-sm focus-visible:ring-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <span className="absolute right-4 top-3.5 text-xs text-muted-foreground">
                Found {filteredProducts.length} items
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
          {searchTerm ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  className={`relative overflow-hidden cursor-pointer transition-all border-muted/20 hover:border-primary/50 group ${product.stock_quantity <= 0 ? 'opacity-60 grayscale' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{product.medicine_name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{product.category}</p>
                      </div>
                      <span className="text-sm font-black text-primary bg-primary/5 px-2 py-1 rounded">₹{product.selling_price}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.stock_quantity <= 0 ? 'bg-destructive/10 text-destructive' :
                        product.stock_quantity < 10 ? 'bg-orange-100 text-orange-700' : 
                        'bg-secondary text-secondary-foreground'
                      }`}>
                        {product.stock_quantity <= 0 ? 'Out of Stock' : `Stock: ${product.stock_quantity}`}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all scale-90 group-hover:scale-100">
                        <Plus size={16} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 opacity-50">
              <Search size={48} strokeWidth={1} />
              <p className="text-lg">Search for a medicine to begin billing</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart and Checkout Section */}
      <Card className="w-[450px] border-muted/20 shadow-2xl flex flex-col h-full bg-card relative z-20">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              Checkout Panel
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
              {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-0 custom-scrollbar relative">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Select Patient</label>
            <SearchableSelect
              options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
              value={selectedPatient}
              onChange={setSelectedPatient}
              placeholder="Search and choose patient..."
            />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Bill Summary</label>
              <div className="space-y-1">
                {cart.map(item => (
                  <div key={item.product_id} className="p-3 rounded-xl border border-muted/20 hover:bg-muted/10 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate pr-4">{item.medicine_name}</p>
                        <p className="text-[10px] text-muted-foreground">Unit Price: ₹{item.price}</p>
                      </div>
                      <Button 
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 hover:bg-white"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </Button>
                        <input 
                          type="number" 
                          className="w-12 text-center bg-transparent border-none text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                        />
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 hover:bg-white"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_stock}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-sm font-black">₹{item.quantity * item.price}</p>
                      </div>
                    </div>
                    {item.quantity >= item.max_stock && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-orange-600 font-bold uppercase">
                        <AlertCircle size={10} /> Max stock reached
                      </div>
                    )}
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground space-y-2">
                    <ShoppingBag size={32} strokeWidth={1} />
                    <p className="text-xs italic">Cart is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-6 border-t p-6 bg-muted/10">
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
              <span className="text-sm font-medium italic font-mono">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end border-t border-muted/30 pt-4">
              <span className="text-sm font-black uppercase tracking-widest text-primary">Payable Amount</span>
              <span className="text-3xl font-black text-primary leading-none">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <Button 
              variant={paymentMode === "Cash" ? "default" : "outline"} 
              className={`gap-2 h-11 rounded-xl font-bold transition-all ${paymentMode === "Cash" ? 'shadow-lg shadow-primary/20 bg-primary' : 'bg-background'}`}
              onClick={() => setPaymentMode("Cash")}
            >
              <Banknote size={16} /> Cash
            </Button>
            <Button 
              variant={paymentMode === "GPay" ? "default" : "outline"} 
              className={`gap-2 h-11 rounded-xl font-bold transition-all ${paymentMode === "GPay" ? 'shadow-lg shadow-primary/20 bg-primary' : 'bg-background'}`}
              onClick={() => setPaymentMode("GPay")}
            >
              <CreditCard size={16} /> Online
            </Button>
          </div>

          <Button 
            className="w-full h-14 text-lg font-black rounded-xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all" 
            disabled={cart.length === 0 || !selectedPatient}
            onClick={handleCheckout}
          >
            Complete Bill
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SalesPage
