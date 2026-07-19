import { useState } from 'react'
import { IconClipboardCheck, IconMail, IconUser } from './icons'
import './ProfileGate.css'

interface ProfileGateProps {
  knownProfiles: string[]
  onSignIn: (email: string) => void
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function ProfileGate({ knownProfiles, onSignIn }: ProfileGateProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError(null)
    onSignIn(email)
  }

  return (
    <div className="profile-gate">
      <div className="profile-gate__card card">
        <span className="profile-gate__mark">
          <IconClipboardCheck size={22} />
        </span>
        <h1>To-Do Organizer</h1>
        <p className="profile-gate__subtitle">
          Enter your email to load your workspace. Everything stays on this device — no account or
          password needed.
        </p>

        <form className="profile-gate__form" onSubmit={handleSubmit} noValidate>
          <label className="profile-gate__field">
            <span>Email</span>
            <div className="profile-gate__input-wrap">
              <IconMail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
          </label>
          {error && <p className="profile-gate__error">{error}</p>}
          <button type="submit" className="btn btn-primary profile-gate__submit">
            Continue
          </button>
        </form>

        {knownProfiles.length > 0 && (
          <div className="profile-gate__known">
            <span className="profile-gate__known-label">Or continue as</span>
            <div className="profile-gate__known-list">
              {knownProfiles.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="profile-gate__known-chip"
                  onClick={() => onSignIn(p)}
                >
                  <IconUser size={13} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
