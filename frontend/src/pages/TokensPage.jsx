import { useState, useEffect } from "react"
import { Ticket, Search, CheckCircle2, XCircle, Clock, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  tokenService, 
  patientService 
} from "@/services/api"

const TokensPage = () => {
  const [tokens, setTokens] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")

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
    "Waiting": "bg-blue-100 text-blue-700 border-blue-200",
    "In Consultation": "bg-purple-100 text-purple-700 border-purple-200",
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Cancelled": "bg-rose-100 text-rose-700 border-rose-200"
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Token System</h2>
          <p className="text-muted-foreground mt-1">Manage patient queue and consultation status.</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Generate New Token</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Select Patient</label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
            </select>
          </div>
          <Button onClick={handleGenerateToken} className="gap-2 h-10 px-6">
            <UserPlus size={18} />
            Generate Token
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {["Waiting", "In Consultation", "Completed", "Cancelled"].map(status => (
          <Card key={status} className="border-muted/20 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                {status}
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted">
                  {tokens.filter(t => t.status === status).length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {tokens.filter(t => t.status === status).map(token => (
                <div 
                  key={token.id} 
                  className={`p-3 rounded-lg border flex flex-col gap-2 ${statusColors[status]}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-black italic">#{token.token_number}</span>
                    <div className="flex gap-1">
                      {status === "Waiting" && (
                        <Button 
                          variant="ghost" size="sm" className="h-7 w-7 p-0" 
                          onClick={() => handleUpdateStatus(token.id, "In Consultation")}
                          title="Start Consultation"
                        >
                          <Clock size={14} />
                        </Button>
                      )}
                      {status === "In Consultation" && (
                        <Button 
                          variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-emerald-500 hover:text-white"
                          onClick={() => handleUpdateStatus(token.id, "Completed")}
                        >
                          <CheckCircle2 size={14} />
                        </Button>
                      )}
                      {(status === "Waiting" || status === "In Consultation") && (
                        <Button 
                          variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-rose-500 hover:text-white"
                          onClick={() => handleUpdateStatus(token.id, "Cancelled")}
                        >
                          <XCircle size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-semibold truncate">
                    {patients.find(p => p.id === token.patient_id)?.name || "Unknown"}
                  </div>
                </div>
              ))}
              {tokens.filter(t => t.status === status).length === 0 && (
                <div className="text-xs text-muted-foreground italic text-center py-4">No patients</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TokensPage
