import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { BarChart3, Lock, User } from "lucide-react"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login(username, password)
      navigate("/")
    } catch (err) {
      setError("Invalid username or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10 transition-all hover:border-white/10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <BarChart3 className="text-primary-foreground" size={24} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Welcome Back</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in to access the clinic management system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                <Input
                  placeholder="Username"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex flex-col gap-4">
            <Button className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
            <p className="text-xs text-center text-zinc-500">
              Demo: admin / admin (after registration)
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
