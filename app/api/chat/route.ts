import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import type { ChatMessage, ChatResponse } from "@/lib/types"

const SYSTEM_PROMPT = `You are a senior React + TypeScript code editor AI.
Your job is to MODIFY an existing project — NOT create a new one.

STRICT RULES:

- DO NOT regenerate the entire app
- DO NOT rewrite all files
- ONLY modify the minimum required files
- KEEP existing structure, styling, and components intact
- RETURN ONLY changed files


## CONTEXT


The user already has a working project.


You will be given:

1. Current project files

2. A user request



## YOUR TASK


- Identify what needs to change
- Modify ONLY those files
- Return ONLY updated files
- Use the provided project files as the source of truth
- Do NOT recreate the full app unless the user explicitly asks for a rebuild

When user asks for code changes
, return ONLY JSON:

{
  "message": "what you did",
  "files": {
    "/App.tsx": "code"
  }
}

If no code needed:
{
  "message": "normal reply"
}

Rules:
- No markdown
- No extra text
- Only valid JSON


## EXAMPLES
BAD:

User: "Add dark mode"

→ Regenerates whole app
 GOOD:

→ Updates only theme logic in existing files

`

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].filter((model): model is string => Boolean(model))

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || "http://127.0.0.1:11434"

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi"

function formatProjectFiles(files?: Record<string, string>) {
  if (!files || Object.keys(files).length === 0) {
    return "No project files were provided."
  }

  return Object.entries(files)
    .map(([path, content]) => `FILE: ${path}\n${content}`)
    .join("\n\n---\n\n")
}

function extractJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null

    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function buildPromptContext(message: string, history: ChatMessage[], files?: Record<string, string>) {
  return [
    SYSTEM_PROMPT,
    `Current project files:\n\n${formatProjectFiles(files)}\n\nOnly modify the minimum files needed. Return changed files only.`,
    ...history
      .filter((entry) => entry.role !== "system")
      .map((entry) => `${entry.role}: ${entry.content}`),
    `user: ${message}`,
  ].join("\n\n")
}

function parseOllamaPayload(data: unknown) {
  if (!data || typeof data !== "object") {
    return ""
  }

  const payload = data as {
    response?: string
    message?: { content?: string }
    error?: string
    done?: boolean
  }

  return payload.response || payload.message?.content || payload.error || ""
}

async function chatWithGemini(
  message: string,
  history: ChatMessage[],
  files?: Record<string, string>
): Promise<ChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return { message: "Missing GEMINI_API_KEY", kind: "message" }
  }

  const ai = new GoogleGenAI({ apiKey })
  const prompt = buildPromptContext(message, history, files)

  let lastError: unknown = null

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      })

      const text = response.text || ""
      const parsed = extractJson(text)

      if (parsed && typeof parsed === "object") {
        const returnedFiles = parsed.files && Object.keys(parsed.files).length > 0 ? parsed.files : undefined
        return {
          message: parsed.message || "Done!",
          kind: returnedFiles ? "edit" : "message",
          files: returnedFiles,
        }
      }

      return { message: text || "Done!", kind: "message" }
    } catch (error) {
      lastError = error
      console.warn(`[generate][gemini] model failed: ${model}`, error)
    }
  }

  console.error("Gemini error:", lastError)
  return { message: "Gemini failed. Try again.", kind: "message" }
}

async function chatWithOllama(
  message: string,
  history: ChatMessage[],
  files?: Record<string, string>
): Promise<ChatResponse> {
  const prompt = buildPromptContext(message, history, files)

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    })

    const rawText = await res.text()
    let data: unknown = rawText

    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {
      data = { response: rawText }
    }

    if (!res.ok) {
      const message = parseOllamaPayload(data) || `Ollama request failed (${res.status})`
      return { message, kind: "message" }
    }

    const responseText = parseOllamaPayload(data)

    if (!responseText) {
      return {
        message: `Ollama returned no text for model "${OLLAMA_MODEL}". Confirm the model is installed and running.`,
        kind: "message",
      }
    }

    try {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        const returnedFiles = parsed.files && Object.keys(parsed.files).length > 0 ? parsed.files : undefined
        return {
          message: parsed.message || "Done!",
          kind: returnedFiles ? "edit" : "message",
          files: returnedFiles,
        }
      }
    } catch {}

    return { message: responseText, kind: "message" }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ollama not running"
    return { message: `Ollama error: ${message}`, kind: "message" }
  }
}

async function chatWithCodeLlama(
  message: string,
  history: ChatMessage[],
  files?: Record<string, string>
): Promise<ChatResponse> {
  const prompt = buildPromptContext(message, history, files)

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "codellama",
        prompt,
        stream: false,
      }),
    })

    const rawText = await res.text()
    let data: unknown = rawText

    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {
      data = { response: rawText }
    }

    if (!res.ok) {
      const payload = parseOllamaPayload(data) || `Ollama request failed (${res.status})`
      return { message: payload, kind: "message" }
    }

    const responseText = parseOllamaPayload(data)

    try {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        const returnedFiles = parsed.files && Object.keys(parsed.files).length > 0 ? parsed.files : undefined
        return {
          message: parsed.message,
          kind: returnedFiles ? "edit" : "message",
          files: returnedFiles,
        }
      }
    } catch {}

    return { message: responseText, kind: "message" }
  } catch (error) {
    const message = error instanceof Error ? error.message : "CodeLlama not running"
    return { message: `CodeLlama error: ${message}`, kind: "message" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, model = "gemini", history = [], files = {} } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      )
    }

    let result: ChatResponse

    switch (model) {
      case "ollama":
        result = await chatWithOllama(message, history, files)
        break
      case "codellama":
        result = await chatWithCodeLlama(message, history, files)
        break
      case "gemini":
      default:
        result = await chatWithGemini(message, history, files)
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}