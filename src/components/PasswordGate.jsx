import { useState } from 'react'

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/ping', {
        headers: { 'x-tool-password': value },
      })
      if (res.ok) {
        sessionStorage.setItem('toolPassword', value)
        onUnlock()
      } else {
        setError('Incorrect password.')
      }
    } catch {
      setError('Could not reach server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#131315',
      }}
    >
      <div style={{ width: 320 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e2e5', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
            Saffire Freycinet
          </div>
          <div style={{ fontSize: 13, color: '#55555a', fontFamily: 'Inter, sans-serif' }}>
            Daylight Manipulator · Enter password to continue
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              backgroundColor: '#1e1f21',
              border: '1px solid #2f3033',
              borderRadius: 4,
              padding: '10px 12px',
              fontSize: 13,
              color: '#e2e2e5',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <div style={{ fontSize: 12, color: '#f28b82', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!value || loading}
            style={{
              backgroundColor: value && !loading ? '#e2e2e5' : '#2f3033',
              color: value && !loading ? '#131315' : '#55555a',
              border: 'none',
              borderRadius: 4,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              cursor: value && !loading ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
