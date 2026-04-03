import { motion } from "framer-motion"
import { NavLink } from "react-router-dom"
import PropTypes from "prop-types"
import Tooltip from "../Tooltip"

const SidebarItem = ({ icon: Icon, label, path, isCollapsed, onClick, badge }) => {
  return (
    <NavLink to={path} onClick={onClick}>
      {({ isActive }) => (
        <Tooltip text={label} side="right" disabled={!isCollapsed}>
          <motion.div
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group ${isActive
                ? "bg-[#a38b73]/20 text-[#f3e5c8]"
                : "text-[#c69c6d] hover:text-[#f3e5c8] hover:bg-[#4a2c2a]/60"
              }`}
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Active indicator - animated left border */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#a38b73] rounded-r-lg"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}

            {/* Icon */}
            <div className="relative shrink-0 w-6 h-6">
              <Icon className="w-6 h-6" />
            </div>

            {/* Label */}
            {!isCollapsed && (
              <motion.span
                className="text-sm font-semibold flex-1 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {label}
              </motion.span>
            )}

            {/* Badge */}
            {badge && !isCollapsed && (
              <motion.span
                className="ml-auto flex items-center justify-center w-5 h-5 bg-[#c69c6d] text-[#2e1a14] text-xs font-bold rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {badge}
              </motion.span>
            )}
          </motion.div>
        </Tooltip>
      )}
    </NavLink>
  )
}

SidebarItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool,
  onClick: PropTypes.func,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

SidebarItem.defaultProps = {
  isCollapsed: false,
  onClick: null,
  badge: null,
}

export default SidebarItem
