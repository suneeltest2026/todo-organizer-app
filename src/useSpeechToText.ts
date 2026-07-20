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

function describeSpeechError(code: string): string {
  switch (code) {
    case 'service-not-allowed':
      return "Voice input isn't available here — this usually happens when the app is opened through another app's built-in browser (like a link tapped in Gmail). Try opening the app link directly in Safari or Chrome instead."
    case 'not-allowed':
      return "Microphone access was blocked. Check your browser's site settings and allow microphone access for this page, then try again."
    case 'audio-capture':
      return 'No microphone was found on this device.'
    case 'network':
      return 'Voice input needs an internet connection to transcribe speech.'
    default:
      return `Voice input error: ${code}`
  }
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
      setError(describeSpeechError(event.error))
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
