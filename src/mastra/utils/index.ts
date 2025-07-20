import { ollama } from 'ollama-ai-provider'

export const modelProvider = ollama(process.env.LLM_MODEL || 'llama3.1')
