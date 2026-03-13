import { createContext, useContext, useState, useEffect } from "react"
import api, { authService } from "@/services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Decode JWT or just set user from localStorage
      const savedUser = localStorage.getItem("user")
      if (savedUser) setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    
    const response = await authService.login(formData)
    const { access_token } = response.data
    
    localStorage.setItem("token", access_token)
    // For now, we manually set a user object. In a real app, you might fetch user info.
    const userObj = { username } 
    setUser(userObj)
    localStorage.setItem("user", JSON.stringify(userObj))
    return response.data
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
