"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/lib/store"
import { sanitizeGeneratedFiles } from "@/lib/generated-files"
import { Button } from "@/components/ui/button"
import type { ChatMessage, AIModel, ChatResponse } from "@/lib/types"

const AI_MODELS: { value: AIModel; label: string; description: string }[] = [
  { value: "gemini", label: "Gemini Pro", description: "Google's most capable model" },
  { value: "ollama", label: "Ollama (Phi 7B)", description: "Local inference" },
  { value: "codellama", label: "CodeLlama", description: "Specialized for code" },
]

export function ChatPanel() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    chatMessages,
    setChatMessages,
    selectedModel,
    setSelectedModel,
    isGenerating,
    setIsGenerating,
    files,
    setFiles,
  } = useWorkspaceStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      project_id: "",
      user_id: "",
      role: "user",
      content: input.trim(),
      model: selectedModel,
      created_at: new Date().toISOString(),
    }

    setChatMessages((previousMessages) => [...previousMessages, userMessage])
    setInput("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
          history: [...chatMessages.slice(-9), userMessage],
          files,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate")

      const data: ChatResponse = await response.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        project_id: "",
        user_id: "",
        role: "assistant",
        content: data.message,
        model: selectedModel,
        created_at: new Date().toISOString(),
      }

      setChatMessages((previousMessages) => [...previousMessages, assistantMessage])

      // If the response includes files, update them
      if (data.kind === "edit" && data.files) {
        const sanitizedFiles = sanitizeGeneratedFiles(data.files)

        setFiles((previousFiles) => ({
          ...previousFiles,
          ...sanitizedFiles,
        }))
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        project_id: "",
        user_id: "",
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        model: selectedModel,
        created_at: new Date().toISOString(),
      }
      setChatMessages((previousMessages) => [...previousMessages, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Model Selector */}
      <div className="border-b border-border p-3">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          AI Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as AIModel)}
          className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {AI_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          {AI_MODELS.find((m) => m.value === selectedModel)?.description}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="size-8 mb-3 opacity-50" />
            <p className="text-sm">Ask the AI to help you build your app</p>
            <p className="text-xs mt-1">Try: &ldquo;Add a navbar&rdquo; or &ldquo;Create a form component&rdquo;</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-secondary"
                )}
              >
                {message.role === "user" ? (
                  <User className="size-4" />
                ) : (
                  <Bot className="size-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3 text-sm",
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-secondary"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="rounded-lg bg-secondary px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Generating</span>
                <span className="flex gap-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI to modify your code..."
            disabled={isGenerating}
            className="flex-1 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isGenerating}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
