import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

const FREE_API_URL = 'https://api.duckduckgo.com/'
const MUSICAL_SCALE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25]

interface DuckDuckGoRelatedTopic {
  Text?: string
  Topics?: DuckDuckGoRelatedTopic[]
}

interface DuckDuckGoResponse {
  AbstractText?: string
  Heading?: string
  RelatedTopics?: DuckDuckGoRelatedTopic[]
}

const buildFallbackJsonResponse = (prompt: string, summary: string) => {
  if (prompt.includes('artisticValue') && prompt.includes('historicalSignificance')) {
    return {
      artisticValue: 60,
      historicalSignificance: 45,
      famousMinter: 0,
      uniqueDesign: 70,
      culturalImpact: 55
    }
  }

  if (prompt.includes('notes: array of 16 objects')) {
    return {
      notes: Array.from({ length: 16 }, (_, i) => ({
        freq: MUSICAL_SCALE_FREQUENCIES[i % MUSICAL_SCALE_FREQUENCIES.length],
        duration: 0.5
      })),
      title: 'Mario Groove Melody'
    }
  }

  if (prompt.includes('pattern: an 8x16 array of booleans')) {
    const shouldActivateStep = (row: number, step: number) =>
      (row === 0 && step % 4 === 0) ||
      (row === 1 && step % 8 === 4) ||
      (row === 2 && step % 2 === 0)

    return {
      pattern: Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 16 }, (_, step) => shouldActivateStep(row, step))
      ),
      description: 'Steady kick/snare groove with driving hi-hats'
    }
  }

  if (prompt.includes('"suggestions"')) {
    return {
      suggestions: [
        `Use this angle to improve impact: ${summary.slice(0, 80) || 'Add concrete context and a stronger narrative.'}`,
        'Add one verified external link to strengthen credibility.',
        'Include a clearer value proposition tied to rarity or provenance.'
      ]
    }
  }

  if (prompt.includes('"message"') && prompt.includes('"contentType"')) {
    return {
      message: summary || 'Great idea! I suggest refining the title, adding context links, and highlighting why this token is unique.',
      suggestions: ['Improve token title', 'Add supporting URL', 'Clarify value proposition'],
      contentType: null,
      searchQuery: '',
      urlSuggestion: ''
    }
  }

  return {
    message: summary || 'I found useful context to help you continue.',
    suggestions: ['Refine your prompt', 'Add more context', 'Include one specific goal']
  }
}

const queryFreeApi = async (promptText: string): Promise<string> => {
  const query = promptText.slice(0, 280)
  const requestUrl = `${FREE_API_URL}?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`
  const response = await fetch(requestUrl)
  if (!response.ok) {
    throw new Error(`Free API request failed with status ${response.status} for query "${query.slice(0, 60)}"`)
  }

  const data = await response.json() as DuckDuckGoResponse
  const relatedTopic = data.RelatedTopics?.flatMap((topic) => [topic, ...(topic.Topics || [])]).find((topic) => typeof topic.Text === 'string')
  const related = relatedTopic?.Text || ''

  return data.AbstractText || related || data.Heading || 'I found limited public context for this request, but you can continue with your current plan and refine details.'
}

const installSparkFallback = () => {
  const existingSpark = window.spark

  const fallbackPrompt = (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => `${acc}${str}${i < values.length ? String(values[i] ?? '') : ''}`, '')

  const fallbackLlm = async (prompt: string, _model?: string, wantsJson?: boolean) => {
    let summary = 'I found limited public context for this request, but you can continue with your current plan and refine details.'
    try {
      summary = await queryFreeApi(prompt)
    } catch (error) {
      console.warn('Free API request failed, using local fallback response.', error)
    }
    const expectsJson = wantsJson || /\bjson\b/i.test(prompt)
    return expectsJson ? JSON.stringify(buildFallbackJsonResponse(prompt, summary)) : summary
  }

  window.spark = {
    ...(existingSpark || {}),
    llmPrompt: existingSpark?.llmPrompt ?? fallbackPrompt,
    llm: async (prompt: string, model?: string, wantsJson?: boolean) => {
      try {
        if (existingSpark?.llm) {
          return await existingSpark.llm(prompt, model, wantsJson)
        }
      } catch (error) {
        console.warn('Spark API unavailable, switching to free fallback API.', error)
      }
      return fallbackLlm(prompt, model, wantsJson)
    }
  }
}

installSparkFallback()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
