import { Agent } from "@mastra/core"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

/**
 * Lightweight helper that generates a short, unique thread title
 * from a user's natural language query. Returns plain text.
 */
export function createTitleAgent(model: any) {
  return new Agent({
    name: 'Title Generator',
    instructions: `You generate concise, unique conversation titles from a user's query.
Rules:
- Output plain text only (no JSON, no markdown)
- Keep it under 60 characters
- Be descriptive and specific
- If possible, include one key entity or metric
Examples:
- "Orders by status last 30 days"
- "Active users by country"
- "Top 10 products by revenue"
`,
    model,
  })
}

export async function generateThreadTitle(user_query: string): Promise<string> {
  // Preferred model: OpenAI GPT-4o mini
  const preferred_model = openai('gpt-4o-mini')
  try {
    const preferred_agent = createTitleAgent(preferred_model)
    const preferred_result = await preferred_agent.generate(`Create a concise title for: ${user_query}`)
    let preferred_title = (preferred_result?.text || '').trim()
    // Strip surrounding quotes/backticks including smart quotes
    preferred_title = preferred_title.replace(/^[\s"'`“”‘’]+|[\s"'`“”‘’]+$/g, '')
    if (preferred_title) return preferred_title.replace(/\s+/g, ' ').slice(0, 60)
  } catch {}

  // Fallback: Claude Haiku
  try {
    const fallback_model = anthropic('claude-3-haiku-20240307')
    const fallback_agent = createTitleAgent(fallback_model)
    const fallback_result = await fallback_agent.generate(`Create a concise title for: ${user_query}`)
    let fallback_title = (fallback_result?.text || '').trim()
    // Strip surrounding quotes/backticks including smart quotes
    fallback_title = fallback_title.replace(/^[\s"'`“”‘’]+|[\s"'`“”‘’]+$/g, '')
    if (fallback_title) return fallback_title.replace(/\s+/g, ' ').slice(0, 60)
  } catch {}

  // Final safety fallback
  return `Conversation - ${new Date().toISOString()}`
}


