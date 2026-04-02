import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { setAuth } from "../utils/auth.service"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setAuth({ email, token: "demo-token" })
    navigate(from, { replace: true })
  }

  return (
    <main className="auth-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  )
}

export default LoginPage
