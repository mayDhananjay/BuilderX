"use client"

import { useMemo } from "react"
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react"
import { sanitizeGeneratedFiles } from "@/lib/generated-files"
import { useWorkspaceStore } from "@/lib/store"

export function LivePreview() {
  const { files, isGenerating } = useWorkspaceStore()
  const filesSignature = useMemo(() => JSON.stringify(files), [files])

  // Transform files to Sandpack format
  const sandpackFiles = useMemo(() => {
    const transformed: Record<string, string> = {}
    
    for (const [path, content] of Object.entries(sanitizeGeneratedFiles(files))) {
      // Sandpack expects paths without leading slash for some files
      const sandpackPath = path.startsWith("/") ? path : `/${path}`
      transformed[sandpackPath] = content
    }

    // Ensure we have required entry files
    if (!transformed["/index.tsx"] && !transformed["/index.js"]) {
      transformed["/index.tsx"] = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`
    }

    if (!transformed["/App.tsx"] && !transformed["/App.js"]) {
      transformed["/App.tsx"] = `
export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to your app!</h1>
      <p>Start building by editing the files.</p>
    </div>
  )
}
`
    }

    if (!transformed["/styles.css"]) {
      transformed["/styles.css"] = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #fafafa;
  color: #0a0a0a;
}
`
    }

    return transformed
  }, [files])

  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Generating your app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-[calc(100vh-180px)] w-full">
      <SandpackProvider
        key={filesSignature}
        template="react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "latest",
          },
        }}
        theme={{
          colors: {
            surface1: "#0a0a0a",
            surface2: "#171717",
            surface3: "#262626",
            clickable: "#a3a3a3",
            base: "#fafafa",
            disabled: "#525252",
            hover: "#404040",
            accent: "#fafafa",
            error: "#ef4444",
            errorSurface: "#450a0a",
          },
          font: {
            body: "'Geist', system-ui, sans-serif",
            mono: "'Geist Mono', monospace",
            size: "14px",
            lineHeight: "1.6",
          },
        }}
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: "100%",
          recompileMode: "delayed",
          recompileDelay: 500,
        }}
      >
        <SandpackLayout style={{ height: "100%", minHeight: "calc(100vh - 180px)", border: "none" }}>
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={true}
            style={{ height: "100%", minHeight: "calc(100vh - 180px)" }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
