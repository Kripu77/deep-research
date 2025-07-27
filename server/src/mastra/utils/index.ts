import { ollama } from 'ollama-ai-provider'

export const modelProvider = ollama(process.env.LLM_MODEL || 'llama3.1', {
  // Enable streaming for real-time responses
  simulateStreaming: true,
})

// Create a non-streaming version for when we need complete responses
export const modelProviderSync = ollama(process.env.LLM_MODEL || 'llama3.1', {
  simulateStreaming: false,
})
