import { motion } from "framer-motion"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useState, forwardRef } from "react"
import PropTypes from "prop-types"

const Input = forwardRef(({
  label,
  type = "text",
  value,
  onChange,
  error,
  success,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <motion.label
          className={`block text-sm font-medium mb-2 transition-colors duration-200 ${error ? "text-red-400" : success ? "text-green-400" : "text-slate-300"
            }`}
          animate={{ color: error ? "#f87171" : success ? "#4ade80" : "#cbd5e1" }}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </motion.label>
      )}

      <div className="relative">
        <motion.input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 backdrop-blur-sm
            border-2 transition-all duration-300 outline-none
            ${error
              ? "border-red-400 shadow-red-400/20"
              : success
                ? "border-green-400 shadow-green-400/20"
                : isFocused
                  ? "border-cyan-400 shadow-cyan-400/30 shadow-lg"
                  : "border-slate-700 hover:border-slate-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
            placeholder:text-slate-500
          `}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />

        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                     hover:bg-slate-700/50 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </motion.button>
        )}

        {(error || success) && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            {error ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-400" />
            )}
          </motion.div>
        )}
      </div>

      {error && (
        <motion.p
          className="mt-2 text-sm text-red-400 flex items-center gap-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </motion.p>
      )}
    </motion.div>
  )
})

Input.displayName = "Input"

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  success: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

export default Input