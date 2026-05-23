"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { useWorkspaceStore } from "@/lib/store"
import { sanitizeGeneratedFiles } from "@/lib/generated-files"
import { ChatPanel } from "@/components/workspace/chat-panel"
import { FileTree } from "@/components/workspace/file-tree"
import { Loader2, Code2, Eye } from "lucide-react"
import type { User } from "@supabase/supabase-js"

const CodeEditor = dynamic(
  () => import("@/components/workspace/code-editor").then((mod) => mod.CodeEditor),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
)

const LivePreview = dynamic(
  () => import("@/components/workspace/live-preview").then((mod) => mod.LivePreview),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
)

function WorkspaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {
    viewMode,
    setViewMode,
    setCurrentProject,
    setIsGenerating,
    addChatMessage,
    setFiles,
    setSteps,
    steps,
    setCurrentStep,
    workspaceVersion,
  } = useWorkspaceStore()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }

      setUser(user)
      setIsLoading(false)

      const prompt = searchParams.get("prompt") || sessionStorage.getItem("pendingPrompt")
      if (prompt) {
        sessionStorage.removeItem("pendingPrompt")
        handleInitialPrompt(prompt, user.id)
      }
    }

    checkAuth()
  }, [router, searchParams, supabase])

  const handleInitialPrompt = async (prompt: string, userId: string) => {
    setError(null)
    setIsGenerating(true)

    const nextSteps = [...steps]
    nextSteps[1].status = "active"
    setSteps(nextSteps)
    setCurrentStep(2)

    try {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
          prompt,
          status: "generating",
        })
        .select()
        .single()

      if (error) throw error

      setCurrentProject(project)

      addChatMessage({
        id: crypto.randomUUID(),
        project_id: project.id,
        user_id: userId,
        role: "system",
        content: `Starting to generate: ${prompt}`,
        created_at: new Date().toISOString(),
      })

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        let backendMsg = "Generation failed"
        try {
          const body = await response.json()
          backendMsg = body?.error || body?.message || JSON.stringify(body)
        } catch {
          const rawText = await response.text().catch(() => "")
          backendMsg = rawText || `${response.status} ${response.statusText}`
        }

        setError(typeof backendMsg === "string" ? backendMsg : "Generation failed")
        addChatMessage({
          id: crypto.randomUUID(),
          project_id: project?.id || "",
          user_id: userId,
          role: "assistant",
          content: `Error generating app: ${backendMsg}`,
          created_at: new Date().toISOString(),
        })
        return
      }

      const { files, message } = await response.json()

      if (!files || typeof files !== "object") {
        setError("AI returned invalid files. Using default template.")
        return
      }

      const sanitizedFiles = sanitizeGeneratedFiles(files)

      setFiles(sanitizedFiles)

      await supabase
        .from("projects")
        .update({
          files: sanitizedFiles,
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      addChatMessage({
        id: crypto.randomUUID(),
        project_id: project.id,
        user_id: userId,
        role: "assistant",
        content: message || "Your app has been generated! You can now preview it or edit the code.",
        created_at: new Date().toISOString(),
      })

      const completedSteps = [...nextSteps]
      completedSteps[1].status = "completed"
      completedSteps[2].status = "active"
      setSteps(completedSteps)
      setCurrentStep(3)
    } catch (error) {
      const userMsg = error instanceof Error ? error.message : "Unknown generation error"
      setError(userMsg)
      addChatMessage({
        id: crypto.randomUUID(),
        project_id: "",
        user_id: userId,
        role: "assistant",
        content: `Sorry, there was an error generating your app: ${userMsg}`,
        created_at: new Date().toISOString(),
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-card">
        <ChatPanel />
      </aside>

      <main className="flex min-w-0 flex-1 overflow-hidden">
        {viewMode === "editor" && (
          <div className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
            <div className="border-b border-border px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Explorer
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <FileTree />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Workspace</p>
            <p className="text-xs text-muted-foreground">Preview or edit the generated app</p>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                viewMode === "editor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="size-4" />
              Code
            </button>
          </div>
        </div>

          {error && (
            <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            {viewMode === "preview" ? (
              <LivePreview />
            ) : (
              <CodeEditor key={workspaceVersion} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  )
}
