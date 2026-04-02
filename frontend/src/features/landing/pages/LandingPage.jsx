import { Link } from "react-router-dom"
import { Rocket, Database, Search, Layers, Sparkles } from "lucide-react"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">NeuroVault</h1>
          <p className="mt-2 text-slate-300 max-w-2xl">Organize, relate and resurface your saved knowledge with AI-powered semantic search and graph intelligence.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold">Login</Link>
          <Link to="/signup" className="px-5 py-2 rounded-xl border border-slate-600 hover:border-cyan-400">Sign Up</Link>
        </div>
      </header>

      <main className="mt-12 max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
        {[
          { icon: <Rocket className="h-6 w-6" />, title: "Quick Capture", text: "Save articles, videos, tweets, images, PDFs from anywhere." },
          { icon: <Database className="h-6 w-6" />, title: "Smart Index", text: "Automatic metadata extraction, tagging, and content embeddings." },
          { icon: <Search className="h-6 w-6" />, title: "Semantic Search", text: "Find related knowledge even with vague queries." },
          { icon: <Layers className="h-6 w-6" />, title: "Graph Intelligence", text: "Explore relationships in a dynamic knowledge graph." },
          { icon: <Sparkles className="h-6 w-6" />, title: "Memory Resurfacing", text: "Auto-notify old insights with context-aware reminders." },
        ].map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3 text-cyan-300">{feature.icon}<h3 className="text-xl font-bold">{feature.title}</h3></div>
            <p className="mt-3 text-slate-300">{feature.text}</p>
          </article>
        ))}
      </main>

      <section className="mt-12 max-w-6xl mx-auto border border-slate-800 rounded-2xl p-6 bg-slate-900/80">
        <h2 className="text-2xl font-bold">Get Started</h2>
        <p className="mt-2 text-slate-300">Create your account or login to enter the dashboard, start adding content, and explore your knowledge graph.</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link to="/signup" className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold text-center">Start Free</Link>
          <Link to="/login" className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 text-center">Already Have Account</Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
