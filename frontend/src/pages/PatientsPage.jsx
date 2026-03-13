import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { patientService } from "@/services/api"

const PatientsPage = () => {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "", age: "", gender: "Male", phone: "", alternate_phone: "", email: "", address: ""
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAll()
      setPatients(response.data)
    } catch (err) {
      console.error("Failed to fetch patients")
    }
  }

  const handleOpenAdd = () => {
    setEditingPatient(null)
    setFormData({ name: "", age: "", gender: "Male", phone: "", alternate_phone: "", email: "", address: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({ ...patient })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, formData)
      } else {
        await patientService.create(formData)
      }
      setIsDialogOpen(false)
      fetchPatients()
    } catch (err) {
      console.error("Failed to save patient")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await patientService.delete(id)
        fetchPatients()
      } catch (err) {
        console.error("Failed to delete patient")
      }
    }
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
          <p className="text-muted-foreground mt-1">Manage your clinic's patient records.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-lg shadow-primary/10">
          <Plus size={18} />
          Register Patient
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-muted/20 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search by name or phone..." 
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
              <TableHead>Name</TableHead>
              <TableHead>Age/Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-semibold">{patient.name}</TableCell>
                  <TableCell>{patient.age} / {patient.gender}</TableCell>
                  <TableCell>
                    <div className="text-sm">{patient.phone}</div>
                    <div className="text-xs text-muted-foreground">{patient.email}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{patient.address}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(patient)}>
                        <Edit size={16} className="text-zinc-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(patient.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium italic">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Register New Patient"}</DialogTitle>
            <DialogDescription>
              Enter the patient's details below to save to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Patient Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.gender} 
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alt Phone</label>
                <Input value={formData.alternate_phone} onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PatientsPage
