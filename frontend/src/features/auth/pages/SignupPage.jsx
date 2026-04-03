import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import AuthLayout from "../../../components/layouts/AuthLayout"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"

const SignupPage = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { handleSignup, status } = useAuth()

  const validateForm = () => {
    const newErrors = {}
    if (!username) newErrors.username = "Username is required"
    else if (username.length < 3) newErrors.username = "Username must be at least 3 characters"
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = "Username can only contain letters, numbers, and underscores"

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

    const result = await handleSignup(username, email, password)
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/app/dashboard", { replace: true })
    } else {
      setErrors({ general: result.payload?.message || "Signup failed. Please try again." })
    }
  }

  const handleInputChange = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join NeuroVault and start organizing your knowledge"
      isLogin={false}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            handleInputChange('username')
          }}
          error={errors.username}
          placeholder="Choose a username"
          required
        />

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
          placeholder="Create a password"
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
          {status === "loading" ? "Creating account..." : "Create account"}
        </Button>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  )
}

export default SignupPage
