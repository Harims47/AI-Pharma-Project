import axios from "axios"

const API_BASE_URL = "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  }),
  register: (userData) => api.post("/auth/register", userData),
}

export const patientService = {
  getAll: () => api.get("/patients/"),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients/", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
}

export const productService = {
  getAll: () => api.get("/products/"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products/", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const supplierService = {
  getAll: () => api.get("/suppliers/"),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers/", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

export const purchaseService = {
  getAll: () => api.get("/purchases/"),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post("/purchases/", data),
}

export const saleService = {
  getAll: () => api.get("/sales/"),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post("/sales/", data),
}

export const tokenService = {
  getAll: () => api.get("/tokens/"),
  create: (data) => api.post("/tokens/", data),
  updateStatus: (id, status) => api.put(`/tokens/${id}?status=${status}`),
  delete: (id) => api.delete(`/tokens/${id}`),
}

export default api
