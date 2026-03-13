import { useState, useEffect } from "react"
import { Ticket, Search, CheckCircle2, XCircle, Clock, UserPlus, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  tokenService, 
  patientService 
} from "@/services/api"
import { SearchableSelect } from "@/components/ui/searchable-select"

const TokensPage = () => {
  const [tokens, setTokens] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tokenRes, patientRes] = await Promise.all([
        tokenService.getAll(),
        patientService.getAll()
      ])
      setTokens(tokenRes.data)
      setPatients(patientRes.data)
    } catch (err) {
      console.error("Failed to fetch data")
    }
  }

  const handleGenerateToken = async () => {
    if (!selectedPatient) return
    
    // Get highest token number for today
    const today = new Date().toISOString().split('T')[0]
    const todayTokens = tokens.filter(t => t.date === today)
    const nextTokenNumber = todayTokens.length > 0 
      ? Math.max(...todayTokens.map(t => t.token_number)) + 1 
      : 1

    try {
      await tokenService.create({
        patient_id: parseInt(selectedPatient),
        token_number: nextTokenNumber,
        date: today,
        status: "Waiting"
      })
      setSelectedPatient("")
      fetchData()
    } catch (err) {
      console.error("Failed to generate token")
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await tokenService.updateStatus(id, status)
      fetchData()
    } catch (err) {
      console.error("Failed to update status")
    }
  }

  const statusColors = {
    "Waiting": "border-l-4 border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/50",
    "In Consultation": "border-l-4 border-l-purple-500 bg-purple-50/30 hover:bg-purple-50/50",
    "Completed": "border-l-4 border-l-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/50",
    "Cancelled": "border-l-4 border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/50"
  }

  const getFilteredTokens = (status) => {
    return tokens
      .filter(t => t.status === status)
      .filter(t => {
        const patientName = patients.find(p => p.id === t.patient_id)?.name || ""
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               t.token_number.toString().includes(searchTerm)
      })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consultation Queue</h2>
          <p className="text-muted-foreground mt-1 text-sm">Real-time status tracking for patient flow.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search token or name..." 
              className="pl-9 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-none shrink-0 relative z-20">
        <div className="p-4 flex gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-2">
              <Users size={12} /> Register Patient for Today
            </label>
            <SearchableSelect
              options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
              value={selectedPatient}
              onChange={setSelectedPatient}
              placeholder="Search and choose patient for token..."
            />
          </div>
          <Button onClick={handleGenerateToken} className="gap-2 h-10 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
            <UserPlus size={18} />
            Assign Token
          </Button>
        </div>
      </Card>

      <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden min-h-0 pb-2">
        {["Waiting", "In Consultation", "Completed", "Cancelled"].map(status => {
          const filtered = getFilteredTokens(status)
          return (
            <div key={status} className="flex flex-col bg-muted/20 rounded-2xl border border-muted/20 overflow-hidden">
              <div className="p-4 bg-muted/40 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'Waiting' ? 'bg-blue-500' : 
                    status === 'In Consultation' ? 'bg-purple-500' : 
                    status === 'Completed' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  <h3 className="text-xs font-black uppercase tracking-[0.15em]">{status}</h3>
                </div>
                <span className="text-[10px] font-bold bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {filtered.map(token => (
                  <div 
                    key={token.id} 
                    className={`p-3 rounded-xl border border-muted/20 bg-card shadow-sm transition-all flex flex-col gap-2 ${statusColors[status]}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-foreground antialiased italic">#{token.token_number}</span>
                      </div>
                      <div className="flex gap-1">
                        {status === "Waiting" && (
                          <Button 
                            variant="secondary" size="icon" className="h-7 w-7 rounded-lg hover:bg-blue-500 hover:text-white" 
                            onClick={() => handleUpdateStatus(token.id, "In Consultation")}
                            title="Start Consultation"
                          >
                            <Clock size={14} />
                          </Button>
                        )}
                        {status === "In Consultation" && (
                          <Button 
                            variant="secondary" size="icon" className="h-7 w-7 rounded-lg hover:bg-emerald-500 hover:text-white"
                            onClick={() => handleUpdateStatus(token.id, "Completed")}
                            title="Complete"
                          >
                            <CheckCircle2 size={14} />
                          </Button>
                        )}
                        {(status === "Waiting" || status === "In Consultation") && (
                          <Button 
                            variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-rose-500 hover:text-white"
                            onClick={() => handleUpdateStatus(token.id, "Cancelled")}
                            title="Cancel"
                          >
                            <XCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground truncate">
                        {patients.find(p => p.id === token.patient_id)?.name || "Unknown Patient"}
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1 mt-0.5">
                        <AlertCircle size={8} /> Reg No: PAT-{token.patient_id}
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-30 gap-2">
                    <Ticket size={24} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-wider italic">Empty Queue</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TokensPage
