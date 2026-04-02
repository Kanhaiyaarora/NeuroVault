import { Navigate, Outlet, useLocation } from "react-router-dom"
import { isAuthenticated } from "../utils/auth.service"

const Protected = () => {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default Protected
