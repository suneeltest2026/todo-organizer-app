import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './UniversalInput.css'
import { recognizeImageText } from '../ocr'
import { cleanOcrNoise } from '../ocrClean'
import { useSpeechToText } from '../useSpeechToText'
import { splitIntoListItems } from '../listSplit'
import { IconCamera, IconKeyboard, IconMic, IconPlus, IconStop } from './icons'

type Mode = 'type' | 'photo' | 'voice'

interface DetectedItems {
  text: string
  items: string[]
}

interface UniversalInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
  /** When a photo yields more than one list item and this is provided, offer to add each as a separate activity instead of merging them into this field. */
  onMultipleDetected?: (items: string[]) => void
}

export default function UniversalInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  disabled = false,
  onMultipleDetected,
}: UniversalInputProps) {
  const [mode, setMode] = useState<Mode>('type')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [detected, setDetected] = useState<DetectedItems | null>(null)
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
    setDetected(null)
    setPhotoPreview(URL.createObjectURL(file))
    setOcrBusy(true)
    setOcrProgress(0)

    try {
      const text = await recognizeImageText(file, (p) => setOcrProgress(p))
      const trimmed = cleanOcrNoise(text)
      const items = splitIntoListItems(trimmed)
      if (onMultipleDetected && items.length > 1) {
        setDetected({ text: trimmed, items })
      } else {
        onChange(value ? `${value}\n${trimmed}` : trimmed)
      }
    } catch {
      setOcrError('Could not read text from that image. Try a clearer photo, or type instead.')
    } finally {
      setOcrBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleConfirmMultiple() {
    if (!detected || !onMultipleDetected) return
    onMultipleDetected(detected.items)
    setDetected(null)
    setPhotoPreview(null)
  }

  function handleUseAsSingle() {
    if (!detected) return
    onChange(value ? `${value}\n${detected.text}` : detected.text)
    setDetected(null)
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
          <IconKeyboard size={15} />
          Type
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'photo'}
          className={`universal-input__tab ${mode === 'photo' ? 'is-active' : ''}`}
          onClick={() => setMode('photo')}
          disabled={disabled}
        >
          <IconCamera size={15} />
          Photo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'voice'}
          className={`universal-input__tab ${mode === 'voice' ? 'is-active' : ''}`}
          onClick={() => setMode('voice')}
          disabled={disabled}
        >
          <IconMic size={15} />
          Voice
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
              onChange={handleFile}
              hidden
            />
            {photoPreview && (
              <img src={photoPreview} alt="Uploaded preview" className="universal-input__preview" />
            )}
            {ocrError && <p className="universal-input__error">{ocrError}</p>}

            {detected && (
              <div className="universal-input__multi-detect">
                <p className="universal-input__multi-detect-title">
                  Found {detected.items.length} items in this photo
                </p>
                <ul className="universal-input__multi-detect-list">
                  {detected.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="universal-input__hint">
                  Double-check against the photo — text that was too small, blurry, or inside a table
                  can get missed. Add any missing items by typing them in after.
                </p>
                <div className="universal-input__multi-detect-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirmMultiple}>
                    <IconPlus size={14} />
                    Add {detected.items.length} separate activities
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleUseAsSingle}>
                    Use as one activity instead
                  </button>
                </div>
              </div>
            )}

            {!detected && (
              <p className="universal-input__hint">
                We'll pull the text out of your photo and drop it below — review and edit before saving.
                If we spot a numbered or lettered list, we'll offer to add each item separately.
              </p>
            )}
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
                {listening ? (
                  <>
                    <IconStop size={15} />
                    Stop recording
                  </>
                ) : (
                  <>
                    <IconMic size={15} />
                    Start recording
                  </>
                )}
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
