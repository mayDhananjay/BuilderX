export function sanitizeGeneratedFileContent(content: string): string {
  const trimmed = content.replace(/^\uFEFF/, "").trim()

  const fencedMatch = trimmed.match(/^```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)\n```$/)
  if (fencedMatch) {
    return fencedMatch[1].trim()
  }

  return trimmed
}

export function sanitizeGeneratedFiles(files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([path, content]) => [path, sanitizeGeneratedFileContent(content)])
  )
}