import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './UniversalInput.css'
import { recognizeImageText } from '../ocr'
import { useSpeechToText } from '../useSpeechToText'

type Mode = 'type' | 'photo' | 'voice'

interface UniversalInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
}

export default function UniversalInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  disabled = false,
}: UniversalInputProps) {
  const [mode, setMode] = useState<Mode>('type')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    supported: speechSupported,
    listening,
    error: speechError,
    start: startListening,
    stop: stopListening,
  } = useSpeechToText({
    onResult: (text) => {
      onChange(value ? `${value} ${text}` : text)
    },
  })

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setOcrError(null)
    setPhotoPreview(URL.createObjectURL(file))
    setOcrBusy(true)
    setOcrProgress(0)

    try {
      const text = await recognizeImageText(file, (p) => setOcrProgress(p))
      const trimmed = text.trim()
      onChange(value ? `${value}\n${trimmed}` : trimmed)
    } catch {
      setOcrError('Could not read text from that image. Try a clearer photo, or type instead.')
    } finally {
      setOcrBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const Field = multiline ? 'textarea' : 'input'

  return (
    <div className="universal-input">
      {label && <label className="universal-input__label">{label}</label>}

      <div className="universal-input__tabs" role="tablist" aria-label="Input method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'type'}
          className={`universal-input__tab ${mode === 'type' ? 'is-active' : ''}`}
          onClick={() => setMode('type')}
          disabled={disabled}
        >
          ⌨️ Type
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'photo'}
          className={`universal-input__tab ${mode === 'photo' ? 'is-active' : ''}`}
          onClick={() => setMode('photo')}
          disabled={disabled}
        >
          📷 Photo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'voice'}
          className={`universal-input__tab ${mode === 'voice' ? 'is-active' : ''}`}
          onClick={() => setMode('voice')}
          disabled={disabled}
        >
          🎤 Voice
        </button>
      </div>

      <div className="universal-input__panel">
        {mode === 'photo' && (
          <div className="universal-input__photo-controls">
            <button
              type="button"
              className="universal-input__action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || ocrBusy}
            >
              {ocrBusy ? `Reading text… ${ocrProgress}%` : 'Take photo / upload image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              hidden
            />
            {photoPreview && (
              <img src={photoPreview} alt="Uploaded preview" className="universal-input__preview" />
            )}
            {ocrError && <p className="universal-input__error">{ocrError}</p>}
            <p className="universal-input__hint">
              We'll pull the text out of your photo and drop it below — review and edit before saving.
            </p>
          </div>
        )}

        {mode === 'voice' && (
          <div className="universal-input__voice-controls">
            {speechSupported ? (
              <button
                type="button"
                className={`universal-input__action-btn ${listening ? 'is-recording' : ''}`}
                onClick={() => (listening ? stopListening() : startListening())}
                disabled={disabled}
              >
                {listening ? '⏹ Stop recording' : '🎙 Start recording'}
              </button>
            ) : (
              <p className="universal-input__error">
                Voice input isn't supported in this browser. Try Chrome or Edge, or type instead.
              </p>
            )}
            {speechError && <p className="universal-input__error">{speechError}</p>}
            {listening && <p className="universal-input__hint">Listening… speak now.</p>}
            <p className="universal-input__hint">
              We'll transcribe your speech and drop it below — review and edit before saving.
            </p>
          </div>
        )}

        <Field
          className="universal-input__field"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          rows={multiline ? 3 : undefined}
        />
      </div>
    </div>
  )
}
