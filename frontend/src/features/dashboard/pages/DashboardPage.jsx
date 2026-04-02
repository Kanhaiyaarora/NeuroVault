import { Link } from "react-router-dom"
import { clearAuth, getAuth } from "../../auth/utils/auth.service"

const DashboardPage = () => {
  const user = getAuth()

  const handleLogout = () => {
    clearAuth()
    window.location.href = "/login"
  }

  return (
    <main className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email || 'user'}!</p>
      <nav>
        <ul>
          <li>
            <Link to="/content">Content</Link>
          </li>
          <li>
            <Link to="/chat">Chat</Link>
          </li>
          <li>
            <Link to="/graph">Graph</Link>
          </li>
        </ul>
      </nav>
      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}

export default DashboardPage
