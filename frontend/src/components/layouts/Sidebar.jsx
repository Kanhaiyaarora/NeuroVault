import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Network,
  Settings,
  Menu,
  X,
  Vault,
} from "lucide-react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import SidebarItem from "./SidebarItem"
import UserMenu from "./UserMenu"
import Tooltip from "../Tooltip"

const Sidebar = ({ onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    return saved ? JSON.parse(saved) : false
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const user = useSelector((state) => state.auth.user)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/app/dashboard",
    },
    {
      icon: FileText,
      label: "Vault",
      path: "/app/content",
      badge: null,
    },
    {
      icon: MessageSquare,
      label: "Chat",
      path: "/app/chat",
    },
    {
      icon: Network,
      label: "Graph",
      path: "/app/graph",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/app/settings",
    },
  ]

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  }

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#a38b73] text-[#2e1a14] hover:bg-[#c69c6d] transition-colors md:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </motion.button>
      )}

      {/* Mobile Backdrop */}
      {isMobile && isMobileOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-screen bg-[#2e1a14] border-r border-[#4a2c2a]/60 flex flex-col z-40 md:relative md:z-auto ${isMobile
          ? isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : ""
          } transition-transform md:transition-none`}
      >
        {/* Header - Logo */}
        <motion.div
          className="flex items-center justify-between px-4 py-6 border-b border-[#4a2c2a]/60"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex items-center gap-2"
            variants={itemVariants}
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#a38b73] to-[#c69c6d] flex items-center justify-center text-[#2e1a14] font-bold">
              <Vault className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <motion.span
                className="font-bold text-[#f3e5c8] text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                NeuroVault
              </motion.span>
            )}
          </motion.div>

          {/* Collapse Toggle - Desktop only */}
          {!isMobile && (
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-[#4a2c2a] text-[#c69c6d] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.div>
            </motion.button>
          )}
        </motion.div>

        {/* Navigation Items */}
        <motion.nav
          className="flex-1 px-3 py-6 space-y-2 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navigationItems.map((item) => (
            <motion.div key={item.path} variants={itemVariants}>
              <SidebarItem
                icon={item.icon}
                label={item.label}
                path={item.path}
                isCollapsed={isCollapsed}
                badge={item.badge}
                onClick={() => isMobile && setIsMobileOpen(false)}
              />
            </motion.div>
          ))}
        </motion.nav>

        {/* User Menu */}
        <motion.div
          className="px-3 py-6 border-t border-[#4a2c2a]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Tooltip
            text={user?.email || "User"}
            side="right"
            disabled={!isCollapsed}
          >
            <div className="w-full">
              <UserMenu user={user} isCollapsed={isCollapsed} />
            </div>
          </Tooltip>
        </motion.div>
      </motion.aside>
    </>
  )
}

Sidebar.propTypes = {
  onCollapsedChange: PropTypes.func,
}

Sidebar.defaultProps = {
  onCollapsedChange: null,
}

export default Sidebar
