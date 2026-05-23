"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Code2,
  Eye,
  FileCode,
  Download,
  LogOut,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface WorkspaceHeaderProps {
  onNewProject?: () => void
}

export function WorkspaceHeader({ onNewProject }: WorkspaceHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { viewMode, setViewMode, files, currentProject, reset } = useWorkspaceStore()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const zip = new JSZip()
      
      // Add all files to the zip
      for (const [path, content] of Object.entries(files)) {
        // Remove leading slash for zip path
        const zipPath = path.startsWith("/") ? path.slice(1) : path
        zip.file(zipPath, content)
      }

      // Add a README
      zip.file(
        "README.md",
        `# ${currentProject?.name || "My App"}

Generated with BuilderX

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [https://builder-x-nine.vercel.app](https://builder-x-nine.vercel.app) in your browser.

## Project Structure

${Object.keys(files)
  .map((f) => `- \`${f}\``)
  .join("\n")}
`
      )

      // Generate and download
      const blob = await zip.generateAsync({ type: "blob" })
      saveAs(blob, `${currentProject?.name || "my-app"}.zip`)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (currentProject?.id) {
        await supabase
          .from("projects")
          .update({
            files,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentProject.id)
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewProject = () => {
    reset()
    onNewProject?.()
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("pendingPrompt")
    }
    router.replace("/workspace")
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="size-8"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
            <Code2 className="size-4 text-background" />
          </div>
          <span className="font-semibold">
            {currentProject?.name || "New Project"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewProject}
          className="gap-2"
        >
          New Project
        </Button>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-border bg-secondary/30 p-1">
          <button
            onClick={() => setViewMode("preview")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              viewMode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="size-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={() => setViewMode("editor")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              viewMode === "editor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode className="size-4" />
            <span className="hidden sm:inline">Editor</span>
          </button>
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span className="hidden sm:inline">Save</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          <span className="hidden sm:inline">Download</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="size-8"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
