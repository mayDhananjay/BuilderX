export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  prompt: string
  files: Record<string, string>
  template_type: "react" | "node"
  status: "draft" | "generating" | "ready" | "error"
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  project_id: string
  user_id: string
  role: "user" | "assistant" | "system"
  content: string
  model?: string
  created_at: string
}

export type ChatResponseKind = "message" | "edit"

export interface ChatResponse {
  kind: ChatResponseKind
  message: string
  files?: Record<string, string>
}

export interface Template {
  id: string
  name: string
  description?: string
  category: string
  files: Record<string, string>
  preview_url?: string
  is_public: boolean
  created_by?: string
  created_at: string
}

export type AIModel = "gemini" | "ollama" | "codellama"

export interface AIConfig {
  model: AIModel
  apiKey?: string
  endpoint?: string
}

export interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
  content?: string
}

export interface WorkspaceStep {
  id: number
  title: string
  description: string
  status: "pending" | "active" | "completed"
}
