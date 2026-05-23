"use client"

import { X, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/lib/store"

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  const iconClasses = "size-3.5 shrink-0"
  
  switch (ext) {
    case "tsx":
    case "jsx":
      return <File className={cn(iconClasses, "text-blue-400")} />
    case "ts":
    case "js":
      return <File className={cn(iconClasses, "text-yellow-400")} />
    case "css":
      return <File className={cn(iconClasses, "text-purple-400")} />
    case "json":
      return <File className={cn(iconClasses, "text-green-400")} />
    default:
      return <File className={cn(iconClasses, "text-muted-foreground")} />
  }
}

export function EditorTabs() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useWorkspaceStore()

  if (openFiles.length === 0) return null

  return (
    <div className="flex h-9 items-center gap-px overflow-x-auto border-b border-border bg-secondary/30">
      {openFiles.map((path) => {
        const filename = path.split("/").pop() || path
        const isActive = path === activeFile

        return (
          <div
            key={path}
            className={cn(
              "group flex h-full cursor-pointer items-center gap-2 border-b-2 px-3 text-sm transition-colors",
              isActive
                ? "border-foreground bg-background text-foreground"
                : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            onClick={() => setActiveFile(path)}
          >
            {getFileIcon(filename)}
            <span className="truncate max-w-32">{filename}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeFile(path)
              }}
              className={cn(
                "rounded p-0.5 transition-opacity hover:bg-accent",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
