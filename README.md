# Deep Research Assistant with Ollama

AI-powered research assistant using Mastra workflows and agents for comprehensive topic exploration and report generation.

## Prerequisites

- Node.js ≥20.9.0
- Ollama with a model that supports function calling (e.g., `llama3.1`, `mistral-nemo`)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Set required variables in `.env`:
```
EXA_API_KEY="your_exa_api_key"
LLM_MODEL="llama3.1"
```

4. Pull Ollama model:
```bash
ollama pull llama3.1
```

## Usage

```bash
yarn dev    # Development server
yarn build  # Build project
yarn start  # Production server
```

## Important Notes

- **Function Calling Required**: Use Ollama models that support function calling (llama3.1, gemma3, etc.)
- **DeepSeek R1 models do NOT support function calling** and will cause errors
- The project uses Exa for web search capabilities

## Architecture

- **Agents**: Research, evaluation, learning extraction, and report generation
- **Workflows**: Automated research and report generation pipelines
- **Tools**: Web search, result evaluation, and learning extraction
- **Storage**: LibSQL for data persistence