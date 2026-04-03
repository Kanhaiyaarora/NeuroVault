import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  FileText,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react"
import AppLayout from "../../../components/layouts/AppLayout"

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user)


  const stats = [
    { icon: FileText, label: "Items Saved", value: "24", color: "#a38b73" },
    { icon: TrendingUp, label: "This Week", value: "8", color: "#c69c6d" },
    {
      icon: MessageSquare,
      label: "Chat Messages",
      value: "12",
      color: "#f3e5c8",
    },
    { icon: Clock, label: "Last Activity", value: "2h ago", color: "#a38b73" },
  ]

  const recentItems = [
    {
      id: 1,
      title: "React Performance Tips",
      type: "article",
      date: "Today",
    },
    {
      id: 2,
      title: "Machine Learning Basics",
      type: "video",
      date: "Yesterday",
    },
    {
      id: 3,
      title: "Design System Patterns",
      type: "pdf",
      date: "2 days ago",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <AppLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-[#f3e5c8] mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-[#c69c6d]">
            Here's what's happening in your vault today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-[#4a2c2a]/60 border border-[#a38b73]/20 rounded-xl p-6 hover:border-[#a38b73]/40 transition-all"
                whileHover={{
                  boxShadow: "0 10px 30px rgba(163, 139, 115, 0.1)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[#a38b73]" />
                </div>
                <p className="text-[#c69c6d] text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-[#f3e5c8] mt-2">
                  {stat.value}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Recent Items Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#f3e5c8]">Recent Items</h2>
            <a
              href="/app/content"
              className="text-[#a38b73] hover:text-[#f3e5c8] flex items-center gap-2 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <motion.div
            className="space-y-3"
            variants={containerVariants}
          >
            {recentItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-[#4a2c2a]/60 border border-[#a38b73]/20 rounded-xl p-4 hover:border-[#a38b73]/40 hover:bg-[#4a2c2a]/80 transition-all cursor-pointer group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-[#f3e5c8] font-semibold group-hover:text-[#c69c6d] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#c69c6d] text-sm mt-1">
                      {item.type} • {item.date}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#a38b73]/20 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-[#a38b73] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-[#f3e5c8] mb-4">
            Quick Actions
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {[
              { label: "Add New Item", icon: "+" },
              { label: "Start Chat", icon: "💬" },
              { label: "View Graph", icon: "🕸️" },
            ].map((action) => (
              <motion.button
                key={action.label}
                variants={itemVariants}
                className="bg-[#a38b73] hover:bg-[#c69c6d] text-[#2e1a14] font-bold py-3 px-6 rounded-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {action.icon} {action.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

export default DashboardPage

