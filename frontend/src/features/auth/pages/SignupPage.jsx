import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { setAuth } from "../utils/auth.service"

const SignupPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setAuth({ email, token: "demo-token" })
    navigate("/", { replace: true })
  }

  return (
    <main className="auth-page">
      <h1>Sign Up</h1>
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
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  )
}

export default SignupPage
