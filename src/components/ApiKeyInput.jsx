import { useState } from 'react'

const labelStyle = { fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 8 }
const inputStyle = {
  width: '100%',
  height: 36,
  padding: '0 10px',
  fontSize: 13,
  color: '#111111',
  backgroundColor: '#ffffff',
  border: '1px solid #e8e8e8',
  borderRadius: 4,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
}
const btnStyle = {
  fontSize: 13,
  color: '#111111',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontFamily: 'Inter, sans-serif',
}

export default function ApiKeyInput({ apiKey, onSave, onClear }) {
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(!apiKey)

  function handleSave() {
    if (!draft.trim()) return
    onSave(draft.trim())
    setDraft('')
    setEditing(false)
  }

  function handleChange() {
    onClear()
    setEditing(true)
    setDraft('')
  }

  return (
    <div>
      <label style={labelStyle}>Google Gemini API Key</label>

      {editing ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Paste your API key"
            style={inputStyle}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            style={{
              height: 36,
              padding: '0 14px',
              fontSize: 13,
              fontWeight: 500,
              color: draft.trim() ? '#ffffff' : '#cccccc',
              backgroundColor: draft.trim() ? '#111111' : '#f0f0f0',
              border: 'none',
              borderRadius: 4,
              cursor: draft.trim() ? 'pointer' : 'default',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Save key
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: '#999999' }}>
              {apiKey.slice(0, 8)}{'•'.repeat(16)}
            </span>
          </div>
          <button onClick={handleChange} style={btnStyle}>Change</button>
        </div>
      )}

      {!apiKey && !editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#999999' }}>No key entered</span>
        </div>
      )}
    </div>
  )
}
