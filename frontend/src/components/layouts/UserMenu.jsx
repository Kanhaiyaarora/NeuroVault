import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, User, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import { useDispatch } from "react-redux"
import { logout } from "../../features/auth/auth.slice"

const UserMenu = ({ user, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const getInitials = (email) => {
    return email
      .split("@")[0]
      .split("")
      .slice(0, 2)
      .map((c) => c.toUpperCase())
      .join("")
  }

  const handleLogout = () => {
    dispatch(logout())
    setIsOpen(false)
    navigate("/login")
  }

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  }

  return (
    <div className="relative">
      {/* User Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${isOpen
            ? "bg-[#a38b73]/20 text-[#f3e5c8]"
            : "text-[#c69c6d] hover:bg-[#4a2c2a]/60 hover:text-[#f3e5c8]"
          }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="relative shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-[#a38b73] to-[#c69c6d] flex items-center justify-center text-[#2e1a14] font-bold text-xs">
          {getInitials(user?.email || "user")}
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <motion.div
            className="flex-1 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm font-semibold line-clamp-1">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-[#c69c6d] line-clamp-1">
              {user?.email || "email@example.com"}
            </p>
          </motion.div>
        )}

        {/* Chevron */}
        {!isCollapsed && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4 text-[#c69c6d]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-[#4a2c2a] border border-[#a38b73]/20 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              {/* Profile */}
              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-[#f3e5c8] text-sm hover:bg-[#2e1a14] transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              {/* Settings */}
              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-[#f3e5c8] text-sm hover:bg-[#2e1a14] transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              {/* Divider */}
              <div className="h-px bg-[#a38b73]/20 my-2" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-[#c69c6d] hover:text-[#f3e5c8] hover:bg-[#2e1a14] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close menu */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

UserMenu.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
  }),
  isCollapsed: PropTypes.bool,
}

UserMenu.defaultProps = {
  user: { email: "user@example.com" },
  isCollapsed: false,
}

export default UserMenu
