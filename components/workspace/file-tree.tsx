"use client"

import { useState, useMemo } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

interface FileTreeNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileTreeNode[]
}

function buildFileTree(files: Record<string, string>): FileTreeNode[] {
  const root: FileTreeNode[] = []
  
  const paths = Object.keys(files).sort()
  
  for (const path of paths) {
    const parts = path.split("/").filter(Boolean)
    let current = root
    let currentPath = ""
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      currentPath += "/" + part
      const isFile = i === parts.length - 1
      
      let node = current.find((n) => n.name === part)
      
      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        }
        current.push(node)
      }
      
      if (!isFile && node.children) {
        current = node.children
      }
    }
  }
  
  return root
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  const iconClasses = "size-4 shrink-0"
  
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
    case "html":
      return <File className={cn(iconClasses, "text-orange-400")} />
    default:
      return <File className={cn(iconClasses, "text-muted-foreground")} />
  }
}

interface FileTreeItemProps {
  node: FileTreeNode
  depth: number
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { activeFile, openFile, deleteFile } = useWorkspaceStore()
  const isActive = activeFile === node.path

  const handleClick = () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded)
    } else {
      openFile(node.path)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete ${node.name}?`)) {
      deleteFile(node.path)
    }
  }

  return (
    <div>
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent",
          isActive && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          <>
            {isExpanded ? (
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
            {isExpanded ? (
              <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <Folder className="size-4 shrink-0 text-muted-foreground" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
        {node.type === "file" && (
          <button
            onClick={handleDelete}
            className="ml-auto hidden rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree() {
  const { files, updateFile } = useWorkspaceStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  
  const tree = useMemo(() => buildFileTree(files), [files])

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      setIsCreating(false)
      return
    }
    
    let path = newFileName.startsWith("/") ? newFileName : "/" + newFileName
    if (!path.includes(".")) {
      path += ".tsx"
    }
    
    updateFile(path, "// New file\n")
    setNewFileName("")
    setIsCreating(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsCreating(true)}
          className="size-6"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {isCreating && (
          <div className="mb-2 flex items-center gap-2 px-2">
            <File className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={handleCreateFile}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile()
                if (e.key === "Escape") {
                  setNewFileName("")
                  setIsCreating(false)
                }
              }}
              placeholder="filename.tsx"
              className="flex-1 bg-transparent text-sm outline-none"
              autoFocus
            />
          </div>
        )}
        {tree.map((node) => (
          <FileTreeItem key={node.path} node={node} depth={0} />
        ))}
      </div>
    </div>
  )
}
