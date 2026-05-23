import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { validateAIResponse } from "@/lib/validator"

type AIResult = { files: Record<string, string>; message: string }

type RateLimitEntry = {
  count: number
  windowStart: number
}

const RATE_LIMIT_MAX_REQUESTS = 20
const RATE_LIMIT_WINDOW_MS = 60_000
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false }
  }

  entry.count++
  return { allowed: true }
}

const SYSTEM_PROMPT = `You are a React + TypeScript code generator.

Return ONLY valid JSON:

{
  "files": {
    "/App.tsx": "...",
    "/index.tsx": "...",
    "/styles.css": "..."
  },
  "message": "Short summary"
}

Rules:
- No markdown
- No explanation
- Always valid JSON
`

// ---------------- GEMINI FIX ----------------

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("Missing API key")

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: SYSTEM_PROMPT },
          { text: `Create app: ${prompt}` }
        ]
      }
    ]
  })

  return response.text || ""
}

// ---------------- HELPERS ----------------

function safeJSON(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

function isQuotaError(error: unknown) {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("rate limit")
  )
}

function fallback(prompt: string): AIResult {
  return {
    files: {
      "/App.tsx": `export default function App(){return <h1>${prompt}</h1>}`,
      "/index.tsx": `import React from "react";import ReactDOM from "react-dom/client";import App from "./App";ReactDOM.createRoot(document.getElementById("root")!).render(<App />);`,
      "/styles.css": `body{font-family:sans-serif}`
    },
    message: "Fallback UI generated"
  }
}

// ---------------- MAIN API ----------------

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 })
    }

    console.log("🔑 Gemini Key:", !!process.env.GEMINI_API_KEY)

    const raw = await callGemini(prompt)

    console.log("🤖 AI RAW:", raw)

    const parsed = safeJSON(raw)

    if (!parsed) {
      console.log("⚠️ JSON parse failed → fallback")
      return NextResponse.json(fallback(prompt))
    }

    const valid = validateAIResponse(parsed)

    if (!valid) {
      console.log("⚠️ Validation failed → fallback")
      return NextResponse.json(fallback(prompt))
    }

    return NextResponse.json(valid)

  } catch (err: any) {
    if (isQuotaError(err)) {
      console.warn("⚠️ Gemini quota reached, using fallback generator")
      return NextResponse.json({
        ...fallback("Quota exceeded. Generated a fallback app instead."),
        message:
          "Gemini quota was exceeded, so a fallback project was generated instead."
      })
    }

    console.error("❌ ERROR:", err.message)

    return NextResponse.json(
      fallback("Error generating app"),
      { status: 500 }
    )
  }
}