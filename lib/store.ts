import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Project, ChatMessage, AIModel, FileNode, WorkspaceStep } from "./types"

interface WorkspaceState {
  // Project
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  updateProjectFiles: (files: Record<string, string>) => void

  // Files
  files: Record<string, string>
  setFiles: (
    files: Record<string, string> | ((previousFiles: Record<string, string>) => Record<string, string>)
  ) => void
  updateFile: (path: string, content: string) => void
  deleteFile: (path: string) => void

  // Editor
  activeFile: string | null
  setActiveFile: (path: string | null) => void
  openFiles: string[]
  openFile: (path: string) => void
  closeFile: (path: string) => void

  // View
  viewMode: "preview" | "editor"
  setViewMode: (mode: "preview" | "editor") => void

  // AI
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  setChatMessages: (
    messages: ChatMessage[] | ((previousMessages: ChatMessage[]) => ChatMessage[])
  ) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void

  // Steps
  steps: WorkspaceStep[]
  setSteps: (steps: WorkspaceStep[]) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  workspaceVersion: number

  // Reset
  reset: () => void
}

const initialSteps: WorkspaceStep[] = [
  { id: 1, title: "Describe Your App", description: "Enter your app requirements", status: "completed" },
  { id: 2, title: "Generate Code", description: "AI generates your application", status: "active" },
  { id: 3, title: "Review & Edit", description: "Customize the generated code", status: "pending" },
  { id: 4, title: "Preview", description: "Test your application live", status: "pending" },
  { id: 5, title: "Download", description: "Export your project", status: "pending" },
]

const defaultFiles: Record<string, string> = {
  "/App.tsx": `import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your App
        </h1>
        <p className="text-gray-600">
          Start building something amazing!
        </p>
      </div>
    </div>
  )
}`,
  "/index.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
  "/styles.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`,
  "/package.json": `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Project
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      updateProjectFiles: (files) =>
        set((state) => ({
          currentProject: state.currentProject
            ? { ...state.currentProject, files }
            : null,
          files,
        })),

      // Files
      files: defaultFiles,
      setFiles: (files) =>
        set((state) => ({
          files: typeof files === "function" ? files(state.files) : files,
        })),
      updateFile: (path, content) =>
        set((state) => ({
          files: { ...state.files, [path]: content },
        })),
      deleteFile: (path) =>
        set((state) => {
          const newFiles = { ...state.files }
          delete newFiles[path]
          return {
            files: newFiles,
            openFiles: state.openFiles.filter((f) => f !== path),
            activeFile: state.activeFile === path ? null : state.activeFile,
          }
        }),

      // Editor
      activeFile: "/App.tsx",
      setActiveFile: (path) => set({ activeFile: path }),
      openFiles: ["/App.tsx"],
      openFile: (path) =>
        set((state) => ({
          openFiles: state.openFiles.includes(path)
            ? state.openFiles
            : [...state.openFiles, path],
          activeFile: path,
        })),
      closeFile: (path) =>
        set((state) => {
          const newOpenFiles = state.openFiles.filter((f) => f !== path)
          return {
            openFiles: newOpenFiles,
            activeFile:
              state.activeFile === path
                ? newOpenFiles[newOpenFiles.length - 1] || null
                : state.activeFile,
          }
        }),

      // View
      viewMode: "preview",
      setViewMode: (mode) => set({ viewMode: mode }),

      // AI
      selectedModel: "gemini",
      setSelectedModel: (model) => set({ selectedModel: model }),
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      setChatMessages: (messages) =>
        set((state) => ({
          chatMessages:
            typeof messages === "function" ? messages(state.chatMessages) : messages,
        })),
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),

      // Steps
      steps: initialSteps,
      setSteps: (steps) => set({ steps }),
      currentStep: 2,
      setCurrentStep: (step) => set({ currentStep: step }),
      workspaceVersion: 0,

      // Reset
      reset: () =>
        set((state) => ({
          currentProject: null,
          files: defaultFiles,
          activeFile: "/App.tsx",
          openFiles: ["/App.tsx"],
          viewMode: "preview",
          chatMessages: [],
          isGenerating: false,
          steps: initialSteps,
          currentStep: 2,
          workspaceVersion: state.workspaceVersion + 1,
        })),
    }),
    {
      name: "workspace-store",
      // Persist only generated/edited files to keep storage usage predictable.
      partialize: (state) => ({ files: state.files }),
    }
  )
)
