import { motion } from "framer-motion"
import { Brain, Sparkles, Database, Search } from "lucide-react"
import PropTypes from "prop-types"

const AuthLayout = ({ children, title, subtitle }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const features = [
    { icon: Brain, text: "AI-Powered Knowledge" },
    { icon: Database, text: "Smart Organization" },
    { icon: Search, text: "Semantic Search" },
    { icon: Sparkles, text: "Memory Resurfacing" },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />

      <motion.div
        className="flex-1 flex"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Panel - Branding */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10" />
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
            <motion.div
              className="mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-20 h-20 bg-linear-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-400/30 mb-6">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                NeuroVault
              </h1>
            </motion.div>

            <motion.p
              className="text-xl text-slate-300 mb-12 max-w-md leading-relaxed"
              variants={itemVariants}
            >
              Transform how you capture, organize, and rediscover knowledge with AI-powered intelligence.
            </motion.p>

            <motion.div
              className="grid grid-cols-2 gap-6 w-full max-w-md"
              variants={itemVariants}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="h-6 w-6 text-cyan-400 mb-2" />
                  <span className="text-sm text-slate-300 text-center">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Form */}
        <motion.div
          className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
          variants={itemVariants}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Mobile Header */}
            <motion.div
              className="lg:hidden text-center mb-8"
              variants={itemVariants}
            >
              <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/30 mx-auto mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                NeuroVault
              </h1>
            </motion.div>

            {/* Form Container */}
            <motion.div
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8"
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-center mb-8"
                variants={itemVariants}
              >
                <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                <p className="text-slate-400">{subtitle}</p>
              </motion.div>

              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthLayout

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
}