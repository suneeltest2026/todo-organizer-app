import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { IconClipboardCheck, IconMail } from './icons'
import './ProfileGate.css'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ProfileGate() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError(null)
    setStatus('sending')
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    })
    if (signInError) {
      setError(signInError.message)
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="profile-gate">
        <div className="profile-gate__card card">
          <span className="profile-gate__mark">
            <IconMail size={22} />
          </span>
          <h1>Check your email</h1>
          <p className="profile-gate__subtitle">
            We sent a sign-in link to <strong>{email.trim()}</strong>. Open it on this device to finish
            signing in — your tasks will then be available on any device where you sign in with this
            email.
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => setStatus('idle')}>
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-gate">
      <div className="profile-gate__card card">
        <span className="profile-gate__mark">
          <IconClipboardCheck size={22} />
        </span>
        <h1>To-Do Organizer</h1>
        <p className="profile-gate__subtitle">
          Sign in with your email. We'll send you a link — no password needed, and your tasks will
          follow you to any device.
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
                autoComplete="email"
                autoFocus
              />
            </div>
          </label>
          {error && <p className="profile-gate__error">{error}</p>}
          <button type="submit" className="btn btn-primary profile-gate__submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
          </button>
        </form>
      </div>
    </div>
  )
}
