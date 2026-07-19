import { useEffect, useRef, useState } from 'react'

// The Web Speech API types aren't in default TS lib DOM typings, so we
// declare the minimal shape we use here.
interface SpeechRecognitionResultLike {
  isFinal: boolean
  [index: number]: { transcript: string }
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface UseSpeechToTextOptions {
  onResult: (finalText: string) => void
}

export function useSpeechToText({ onResult }: UseSpeechToTextOptions) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const Ctor = getSpeechRecognitionCtor()

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function start() {
    if (!Ctor) {
      setError('Voice input is not supported in this browser.')
      return
    }
    setError(null)
    const recognition = new Ctor()
    recognition.lang = navigator.language || 'en-US'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        }
      }
      if (finalText.trim()) {
        onResult(finalText.trim())
      }
    }
    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'no-speech') return
      setError(`Voice input error: ${event.error}`)
      setListening(false)
    }
    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  function stop() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return { supported: Boolean(Ctor), listening, error, start, stop }
}
