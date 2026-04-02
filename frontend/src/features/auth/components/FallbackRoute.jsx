import { Navigate } from "react-router-dom"
import { isAuthenticated } from "../utils/auth.service"

const FallbackRoute = () => {
  return isAuthenticated() ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/" replace />
}

export default FallbackRoute
