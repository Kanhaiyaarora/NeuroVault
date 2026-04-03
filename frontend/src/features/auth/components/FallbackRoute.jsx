import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const FallbackRoute = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/" replace />
}

export default FallbackRoute
