import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import PropTypes from "prop-types"

const Tooltip = ({ children, text, side = "right", disabled = false }) => {
  const [isVisible, setIsVisible] = React.useState(false)

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8, x: side === "right" ? -10 : 10 },
    visible: { opacity: 1, scale: 1, x: 0 },
  }

  const sideConfig = {
    right: "left-full ml-3",
    left: "right-full mr-3",
  }

  if (disabled) {
    return children
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className={`absolute top-1/2 -translate-y-1/2 ${sideConfig[side]} z-50 whitespace-nowrap`}
          >
            <div className="bg-[#4a2c2a] text-[#f3e5c8] px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-[#a38b73]/30">
              {text}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#4a2c2a] transform ${side === "right"
                    ? "-right-1 -rotate-45"
                    : "-left-1 rotate-45"
                  }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  side: PropTypes.oneOf(["right", "left"]),
  disabled: PropTypes.bool,
}

Tooltip.defaultProps = {
  side: "right",
  disabled: false,
}

export default Tooltip
