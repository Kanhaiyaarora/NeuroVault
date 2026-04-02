import { createBrowserRouter, Navigate } from "react-router-dom"
import Protected from "../features/auth/components/Protected"
import LoginPage from "../features/auth/pages/LoginPage"
import SignupPage from "../features/auth/pages/SignupPage"
import DashboardPage from "../features/dashboard/pages/DashboardPage"
import ContentPage from "../features/content/pages/ContentPage"
import ChatPage from "../features/chat/pages/ChatPage"
import GraphPage from "../features/graph/pages/GraphPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "content", element: <ContentPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "graph", element: <GraphPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
])