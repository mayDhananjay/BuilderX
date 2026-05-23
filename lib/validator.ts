import { z } from "zod"

export const aiResponseSchema = z.object({
  files: z.record(z.string()),
  message: z.string(),
})

export type AIResponse = z.infer<typeof aiResponseSchema>

export function validateAIResponse(input: unknown): AIResponse | null {
  const parsed = aiResponseSchema.safeParse(input)
  if (!parsed.success) return null
  return parsed.data
}
