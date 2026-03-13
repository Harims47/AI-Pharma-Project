import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import DashboardLayout from "./components/layout/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import LoginPage from "./pages/LoginPage"
import PatientsPage from "./pages/PatientsPage"
import ProductsPage from "./pages/ProductsPage"
import TokensPage from "./pages/TokensPage"
import SalesPage from "./pages/SalesPage"
import SuppliersPage from "./pages/SuppliersPage"
import PurchasesPage from "./pages/PurchasesPage"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="tokens" element={<TokensPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
