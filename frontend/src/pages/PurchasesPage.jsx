import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Trash2, Search, FileText, Calendar, User, Hash } from "lucide-react"
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { supplierService, productService, purchaseService } from "@/services/api"

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingPurchase, setViewingPurchase] = useState(null)
  
  // New Purchase state
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [cart, setCart] = useState([])
  const [productSearch, setProductSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [purRes, supRes, prodRes] = await Promise.all([
        purchaseService.getAll(),
        supplierService.getAll(),
        productService.getAll()
      ])
      setPurchases(purRes.data)
      setSuppliers(supRes.data)
      setProducts(prodRes.data)
    } catch (err) {
      console.error("Failed to fetch data")
    }
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id)
    if (!existing) {
      setCart([...cart, { 
        product_id: product.id, 
        medicine_name: product.medicine_name, 
        quantity: 1, 
        purchase_price: product.purchase_price,
        batch_number: "",
        expiry_date: ""
      }])
    }
  }

  const updateCartItem = (productId, field, value) => {
    setCart(cart.map(item => 
      item.product_id === productId ? { ...item, [field]: value } : item
    ))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const totalAmount = cart.reduce((acc, item) => acc + (item.purchase_price * item.quantity), 0)

  const handleCompletePurchase = async () => {
    if (!selectedSupplier || !invoiceNumber || cart.length === 0) {
      alert("Please fill in all required fields and add items.")
      return
    }

    // Basic validation for cart items
    for (const item of cart) {
      if (!item.batch_number || !item.expiry_date || item.quantity <= 0 || item.purchase_price <= 0) {
        alert(`Missing details for ${item.medicine_name}. Batch, Expiry, Qty, and Price are required.`)
        return
      }
    }

    try {
      await purchaseService.create({
        supplier_id: parseInt(selectedSupplier),
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        items: cart.map(({ product_id, quantity, purchase_price, batch_number, expiry_date }) => ({
          product_id, quantity, purchase_price, batch_number, expiry_date
        }))
      })
      alert("Purchase recorded successfully!")
      setIsAddingNew(false)
      setCart([])
      setSelectedSupplier("")
      setInvoiceNumber("")
      fetchData()
    } catch (err) {
      alert("Failed to save purchase: " + (err.response?.data?.detail || "Unknown error"))
    }
  }

  const handleViewPurchase = (purchase) => {
    setViewingPurchase(purchase)
    setIsDialogOpen(true)
  }

  if (isAddingNew) {
    return (
      <div className="flex gap-8 h-[calc(100vh-120px)] animate-in slide-in-from-right duration-500">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">New Inventory Intake</h2>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>Back to List</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-card p-6 rounded-xl border border-muted/20 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User size={14} className="text-primary" /> Supplier
              </label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Hash size={14} className="text-primary" /> Invoice Number
              </label>
              <Input 
                placeholder="e.g. INV-2024-001" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto space-y-4">
            <h3 className="font-semibold text-lg">Purchase Items</h3>
            <div className="rounded-xl border border-muted/20 bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Medicine</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="w-32">Price (₹)</TableHead>
                    <TableHead className="w-40">Batch No.</TableHead>
                    <TableHead className="w-44">Expiry Date</TableHead>
                    <TableHead className="w-24 text-right">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.medicine_name}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateCartItem(item.product_id, "quantity", parseInt(e.target.value))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.purchase_price} 
                          onChange={(e) => updateCartItem(item.product_id, "purchase_price", parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="BATCH-123" 
                          value={item.batch_number} 
                          onChange={(e) => updateCartItem(item.product_id, "batch_number", e.target.value)}
                          className="h-8 text-xs uppercase"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="date" 
                          value={item.expiry_date} 
                          onChange={(e) => updateCartItem(item.product_id, "expiry_date", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold">₹{item.quantity * item.purchase_price}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(item.product_id)}>
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cart.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                        No medicines added. Search and select items from the sidebar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="w-[350px] space-y-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Search size={16} /> Add Medicines
              </CardTitle>
              <Input 
                placeholder="Search inventory..." 
                className="mt-2"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-2">
              {products.filter(p => p.medicine_name.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                <div 
                  key={product.id} 
                  className="p-3 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all group flex justify-between items-center"
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <p className="text-sm font-semibold">{product.medicine_name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{product.category}</p>
                  </div>
                  <Plus size={14} className="text-muted-foreground group-hover:text-primary" />
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t bg-muted/10 p-6 flex flex-col gap-4">
              <div className="w-full flex justify-between items-center">
                <span className="text-muted-foreground">Grand Total</span>
                <span className="text-2xl font-black text-primary">₹{totalAmount}</span>
              </div>
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                disabled={cart.length === 0 || !selectedSupplier || !invoiceNumber}
                onClick={handleCompletePurchase}
              >
                Confirm Intake
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase History</h2>
          <p className="text-muted-foreground mt-1">Track inventory restocks and supplier invoices.</p>
        </div>
        <Button onClick={() => setIsAddingNew(true)} className="gap-2">
          <ShoppingCart size={18} />
          New Purchase
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-muted/20 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search by Invoice or Supplier..." 
            className="pl-10 max-w-sm border-none shadow-none focus-visible:ring-0 bg-transparent" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-muted/20 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.filter(p => 
              p.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
              p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((purchase) => (
              <TableRow key={purchase.id} className="hover:bg-muted/20">
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-muted-foreground" />
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm font-bold text-primary">{purchase.invoice_number}</TableCell>
                <TableCell>{purchase.supplier_name || `ID: ${purchase.supplier_id}`}</TableCell>
                <TableCell className="font-black text-sm">₹{purchase.total_amount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleViewPurchase(purchase)}>
                    <FileText size={16} /> Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No purchase history found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="text-primary" /> Purchase Receipt Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-8 text-sm bg-muted/20 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Supplier</p>
                <p className="text-lg font-bold">{viewingPurchase?.supplier_name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Invoice Number</p>
                <p className="text-lg font-mono font-bold text-primary">{viewingPurchase?.invoice_number}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold border-b pb-2">Line Items</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingPurchase?.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.product_name || `Product ID: ${item.product_id}`}</TableCell>
                      <TableCell className="font-mono text-xs">{item.batch_number}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.purchase_price}</TableCell>
                      <TableCell className="text-right font-bold">₹{item.quantity * item.purchase_price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center border-t pt-6">
              <span className="text-muted-foreground">Generated Date: {viewingPurchase && new Date(viewingPurchase.purchase_date).toLocaleString()}</span>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-bold uppercase">Grand Total</p>
                <p className="text-3xl font-black text-primary font-mono leading-none mt-1">₹{viewingPurchase?.total_amount}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button onClick={() => setIsDialogOpen(false)}>Close Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PurchasesPage
