import { useState, useEffect, useRef } from 'react'

export interface VoiceInputOptions {
  onResult: (transcript: string) => void
  onError?: (error: string) => void
  continuous?: boolean
  interimResults?: boolean
}

export function useVoiceInput({
  onResult,
  onError,
  continuous = false,
  interimResults = true
}: VoiceInputOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognitionClass) {
      setIsSupported(false)
      onError?.('Speech recognition is not supported in this browser')
      return
    }

    setIsSupported(true)
    const recognition = new SpeechRecognitionClass()
    
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')

      onResult(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please check your device.',
        'not-allowed': 'Microphone access denied. Please enable it in browser settings.',
        'network': 'Network error. Please check your connection.',
        'aborted': 'Speech recognition aborted.'
      }
      
      onError?.(errorMessages[event.error] || `Speech recognition error: ${event.error}`)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, interimResults, onResult, onError])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        onError?.('Failed to start voice recognition')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening
  }
}
