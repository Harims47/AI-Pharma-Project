import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Truck } from "lucide-react"
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
import { supplierService } from "@/services/api"

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  
  const [formData, setFormData] = useState({
    supplier_name: "", phone: "", email: "", address: "", gst_number: ""
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll()
      setSuppliers(response.data)
    } catch (err) {
      console.error("Failed to fetch suppliers")
    }
  }

  const handleOpenAdd = () => {
    setEditingSupplier(null)
    setFormData({ supplier_name: "", phone: "", email: "", address: "", gst_number: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({ ...supplier })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData)
      } else {
        await supplierService.create(formData)
      }
      setIsDialogOpen(false)
      fetchSuppliers()
    } catch (err) {
      console.error("Failed to save supplier")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this supplier?")) {
      try {
        await supplierService.delete(id)
        fetchSuppliers()
      } catch (err) {
        console.error("Failed to delete supplier")
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-muted-foreground mt-1">Manage medicine vendors and contact info.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} />
          Add Supplier
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-muted/20 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search suppliers..." 
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
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.filter(s => s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())).map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-muted/20">
                <TableCell className="font-semibold">{supplier.supplier_name}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{supplier.phone}</div>
                  <div className="text-xs text-muted-foreground">{supplier.email}</div>
                </TableCell>
                <TableCell className="text-sm">{supplier.gst_number || "N/A"}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{supplier.address}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(supplier)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Name</label>
              <Input value={formData.supplier_name} onChange={(e) => setFormData({...formData, supplier_name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GST Number</label>
                <Input value={formData.gst_number} onChange={(e) => setFormData({...formData, gst_number: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Supplier</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SuppliersPage
