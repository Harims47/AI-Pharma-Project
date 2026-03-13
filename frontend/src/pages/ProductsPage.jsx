import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { productService, supplierService } from "@/services/api"
import { SearchableSelect } from "@/components/ui/searchable-select"

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  const [formData, setFormData] = useState({
    medicine_name: "", category: "Tablet", manufacturer: "", batch_number: "", 
    expiry_date: "", purchase_price: "", selling_price: "", 
    stock_quantity: 0, supplier_id: "", hsn_code: "", mrp: "", unit: "Strip"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prodRes, supRes] = await Promise.all([
        productService.getAll(),
        supplierService.getAll()
      ])
      setProducts(prodRes.data)
      setSuppliers(supRes.data)
    } catch (err) {
      console.error("Failed to fetch products/suppliers")
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData({ 
      medicine_name: "", category: "Tablet", manufacturer: "", batch_number: "", 
      expiry_date: "", purchase_price: "", selling_price: "", 
      stock_quantity: 0, supplier_id: suppliers[0]?.id || "", hsn_code: "", mrp: "", unit: "Strip"
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setFormData({ ...product })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData, supplier_id: parseInt(formData.supplier_id) }
      if (editingProduct) {
        await productService.update(editingProduct.id, data)
      } else {
        await productService.create(data)
      }
      setIsDialogOpen(false)
      fetchData()
    } catch (err) {
      console.error("Failed to save product")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this medicine?")) {
      try {
        await productService.delete(id)
        fetchData()
      } catch (err) {
        console.error("Failed to delete product")
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pharmacy Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage medicines and stock levels.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-lg shadow-primary/10">
          <Plus size={18} />
          Add Medicine
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-muted/20 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search by medicine name or category..." 
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
              <TableHead>Medicine Name</TableHead>
              <TableHead>Batch / Expiry</TableHead>
              <TableHead>Price (P/S)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.filter(p => p.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="font-semibold">{product.medicine_name}</div>
                  <div className="text-xs text-muted-foreground">{product.category} | {product.manufacturer}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{product.batch_number}</div>
                  <div className={`text-xs ${new Date(product.expiry_date) < new Date() ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                    Exp: {product.expiry_date}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">Purch: ₹{product.purchase_price}</div>
                  <div className="text-sm font-bold">Sell: ₹{product.selling_price}</div>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    product.stock_quantity < 20 ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {product.stock_quantity} units
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Medicine Name</label>
              <Input value={formData.medicine_name} onChange={(e) => setFormData({...formData, medicine_name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manufacturer</label>
              <Input value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch No</label>
              <Input value={formData.batch_number} onChange={(e) => setFormData({...formData, batch_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Price</label>
              <Input type="number" step="0.01" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Selling Price</label>
              <Input type="number" step="0.01" value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <SearchableSelect
                options={suppliers.map(s => ({ value: s.id, label: s.supplier_name }))}
                value={formData.supplier_id}
                onChange={(val) => setFormData({...formData, supplier_id: val})}
                placeholder="Search supplier..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">HSN Code</label>
              <Input value={formData.hsn_code} onChange={(e) => setFormData({...formData, hsn_code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">MRP</label>
              <Input type="number" step="0.01" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit (e.g Strip)</label>
              <Input value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
            </div>
            
            <div className="col-span-3 flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Medicine</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default ProductsPage
