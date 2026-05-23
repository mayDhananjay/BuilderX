"use client"

import { useCallback } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { useWorkspaceStore } from "@/lib/store"
import { EditorTabs } from "./editor-tabs"
import { FileCode2 } from "lucide-react"

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript"
    case "js":
    case "jsx":
      return "javascript"
    case "css":
      return "css"
    case "json":
      return "json"
    case "html":
      return "html"
    case "md":
      return "markdown"
    default:
      return "plaintext"
  }
}

export function CodeEditor() {
  const { files, activeFile, updateFile } = useWorkspaceStore()

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Configure Monaco theme
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#fafafa",
        "editorLineNumber.foreground": "#525252",
        "editorLineNumber.activeForeground": "#a3a3a3",
        "editor.selectionBackground": "#27272a",
        "editor.lineHighlightBackground": "#171717",
        "editorCursor.foreground": "#fafafa",
        "editorIndentGuide.background": "#262626",
      },
    })
    monaco.editor.setTheme("custom-dark")

    // Configure TypeScript/JavaScript
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    })

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
  }

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeFile && value !== undefined) {
        updateFile(activeFile, value)
      }
    },
    [activeFile, updateFile]
  )

  const content = activeFile ? files[activeFile] || "" : ""
  const language = activeFile ? getLanguageFromPath(activeFile) : "plaintext"

  return (
    <div className="flex h-full flex-col bg-background">
      <EditorTabs />
      {activeFile ? (
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={content}
            onChange={handleChange}
            onMount={handleEditorMount}
            theme="custom-dark"
            options={{
              fontSize: 14,
              fontFamily: "'Geist Mono', monospace",
              lineHeight: 1.6,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              bracketPairColorization: { enabled: true },
              renderLineHighlight: "gutter",
              overviewRulerBorder: false,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
          <FileCode2 className="mb-4 size-12 opacity-50" />
          <p>Select a file to edit</p>
        </div>
      )}
    </div>
  )
}
