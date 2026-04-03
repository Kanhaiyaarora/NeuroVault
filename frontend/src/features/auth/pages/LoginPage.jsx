import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import AuthLayout from "../../../components/layouts/AuthLayout"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogin, status } = useAuth()
  const from = location.state?.from?.pathname || "/app/dashboard"

  const validateForm = () => {
    const newErrors = {}
    if (!email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email"

    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      // Shake animation for errors
      return
    }

    const result = await handleLogin(email, password)
    if (result.meta.requestStatus === "fulfilled") {
      navigate(from, { replace: true })
    } else {
      setErrors({ general: result.payload?.message || "Login failed. Please try again." })
    }
  }

  const handleInputChange = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NeuroVault account"
      isLogin={true}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            handleInputChange('email')
          }}
          error={errors.email}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            handleInputChange('password')
          }}
          error={errors.password}
          placeholder="Enter your password"
          required
        />

        {errors.general && (
          <motion.div
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-red-400 text-sm text-center">{errors.general}</p>
          </motion.div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={status === "loading"}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </Button>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  )
}

export default LoginPage
