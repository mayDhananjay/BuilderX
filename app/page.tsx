"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Zap, Code2, Sparkles, ArrowRight, Github, Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GridBackground } from "@/components/ui/grid-background"
import { Spotlight } from "@/components/ui/spotlight"
import { FlipWords } from "@/components/ui/text-effects"
import { MovingBorder } from "@/components/ui/moving-border"
import { createClient } from "@/lib/supabase/client"

export default function LandingPage() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(true)
    try {
      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback`

      const options: any = { redirectTo }
      if (prompt && prompt.trim()) {
        options.queryParams = { prompt: prompt.trim() }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      })
      if (error) throw error
    } catch {
      setIsLoading(false)
    }
  }

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    // Store prompt in session storage for after auth
    sessionStorage.setItem("pendingPrompt", prompt)

    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push(`/workspace?prompt=${encodeURIComponent(prompt)}`)
    } else {
      // Show auth modal or redirect to auth
      document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const features = [
    {
      icon: <Sparkles className="size-6" />,
      title: "AI-Powered Generation",
      description: "Describe your app and watch it come to life with Gemini, Ollama, or CodeLlama",
    },
    {
      icon: <Code2 className="size-6" />,
      title: "Full-Stack Templates",
      description: "Generate complete React and Node.js applications with modern best practices",
    },
    {
      icon: <Zap className="size-6" />,
      title: "Live Preview",
      description: "See your app running in real-time with hot reload as you make changes",
    },
  ]

  return (
    <GridBackground className="min-h-screen">
      <Spotlight className="absolute inset-0" fill="white" />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground">
            <Code2 className="size-5 text-background" />
          </div>
          <span className="text-xl font-bold tracking-tight">BuilderX</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#auth-section" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Get Started
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-20 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            <span>AI-Powered Development</span>
          </div>
          
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Build{" "}
            <FlipWords
              words={["React Apps", "Node.js APIs", "Full-Stack Projects", "Modern UIs"]}
              className="text-foreground"
            />{" "}
            <br className="hidden sm:block" />
            with AI Assistance
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Describe your application in plain English. Get production-ready code, 
            live previews, and downloadable projects in minutes.
          </p>
        </motion.div>

        {/* Prompt Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handlePromptSubmit}
          className="mt-12 w-full max-w-3xl"
        >
          <div className="relative">
            <MovingBorder
              as="div"
              borderRadius="1rem"
              containerClassName="w-full"
              className="w-full p-0"
              duration={3000}
            >
              <div className="flex w-full flex-col gap-3 bg-card p-2 sm:flex-row sm:items-center sm:p-2">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your app... e.g., 'A todo app with authentication and dark mode'"
                    className="w-full bg-transparent py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 whitespace-nowrap"
                  disabled={!prompt.trim()}
                >
                  Generate App
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </MovingBorder>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {["E-commerce dashboard", "Blog with CMS", "Chat application"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-border/50 bg-secondary/30 px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.form>

        {/* Features Grid */}
        <motion.section
          id="features"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-32 grid w-full max-w-5xl gap-6 md:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:bg-card"
            >
              <div className="mb-4 inline-flex rounded-lg bg-secondary p-3 text-foreground">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Auth Section */}
        <motion.section
          id="auth-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-32 mt-32 w-full max-w-md"
        >
          <div className="rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm">
            <h2 className="mb-2 text-center text-2xl font-bold">Get Started</h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Sign in to start building your application
            </p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-3"
                onClick={() => handleSignIn("google")}
                disabled={isLoading}
              >
                <Chrome className="size-5" />
                Continue with Google
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-3"
                onClick={() => handleSignIn("github")}
                disabled={isLoading}
              >
                <Github className="size-5" />
                Continue with GitHub
              </Button>
            </div>
            
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">BuilderX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with AI, for developers
          </p>
        </div>
      </footer>
    </GridBackground>
  )
}
