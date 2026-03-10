import { useState, useEffect } from 'react'
import { TIME_OPTIONS } from './TimeSelector.jsx'

const secondaryBtn = {
  fontSize: 12,
  color: '#8a8a8f',
  backgroundColor: 'transparent',
  border: '1px solid #2f3033',
  borderRadius: 4,
  padding: '6px 12px',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  letterSpacing: '0.02em',
}

export default function ImageCard({ item, onRegenerate, onDelete }) {
  const [showOriginal, setShowOriginal] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const timeOption = TIME_OPTIONS.find(o => o.value === item.timeOfDay)

  useEffect(() => {
    if (!lightbox) return
    const onKey = e => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  function formatTimestamp(ts) {
    const d = new Date(ts)
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  }

  function handleSave() {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${item.generatedImageBase64}`
    link.download = item.filename
    link.click()
  }

  function handleRegenerate() {
    onRegenerate({
      sourceBase64: item.sourceImageBase64,
      sourceMimeType: item.sourceMimeType,
      sourceDataUrl: `data:${item.sourceMimeType};base64,${item.sourceImageBase64}`,
      timeOfDay: item.timeOfDay,
    })
  }

  return (
    <div
      style={{
        border: '1px solid #2f3033',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1e1f21',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #2f3033',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <img
          src={`data:${item.sourceMimeType};base64,${item.sourceImageBase64}`}
          alt="source"
          style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 3, border: '1px solid #2f3033', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#e2e2e5', fontWeight: 500 }}>
            {timeOption?.label || item.timeOfDay}
          </div>
          <div style={{ fontSize: 11, color: '#55555a', marginTop: 1 }}>
            {formatTimestamp(item.timestamp)}
          </div>
        </div>
        <button
          onClick={() => setLightbox(true)}
          title="View fullscreen"
          style={{
            background: 'transparent', border: '1px solid #2f3033', borderRadius: 4,
            color: '#8a8a8f', cursor: 'pointer', padding: '4px 6px',
            display: 'flex', alignItems: 'center', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#a8c7fa'; e.currentTarget.style.color = '#e2e2e5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2f3033'; e.currentTarget.style.color = '#8a8a8f' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 1h4v4M5 13H1V9M13 9v4h-4M1 5V1h4"/>
          </svg>
        </button>
      </div>

      {/* Image — edge to edge, toggleable */}
      <div style={{ position: 'relative' }}>
        <img
          src={showOriginal
            ? `data:${item.sourceMimeType};base64,${item.sourceImageBase64}`
            : `data:image/png;base64,${item.generatedImageBase64}`}
          alt={showOriginal ? 'original' : `${item.timeOfDay} conversion`}
          onClick={() => setLightbox(true)}
          style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
        />
        <button
          onClick={() => setShowOriginal(s => !s)}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#e2e2e5',
            backgroundColor: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          {showOriginal ? 'After' : 'Before'}
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Image */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: '92vw', maxHeight: '82vh' }}
          >
            <img
              src={showOriginal
                ? `data:${item.sourceMimeType};base64,${item.sourceImageBase64}`
                : `data:image/png;base64,${item.generatedImageBase64}`}
              alt={showOriginal ? 'original' : `${item.timeOfDay} conversion`}
              style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 6, display: 'block' }}
            />
            {/* Before/After */}
            <button
              onClick={() => setShowOriginal(s => !s)}
              style={{
                position: 'absolute', bottom: 12, right: 12,
                fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: '#e2e2e5', backgroundColor: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
                padding: '5px 10px', cursor: 'pointer', backdropFilter: 'blur(4px)',
              }}
            >
              {showOriginal ? 'After' : 'Before'}
            </button>
          </div>

          {/* Toolbar */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}
          >
            <span style={{ fontSize: 13, color: '#8a8a8f', fontFamily: 'Inter, sans-serif' }}>
              {timeOption?.label || item.timeOfDay} · {new Date(item.timestamp).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
            </span>
            <button onClick={handleSave} style={{ ...secondaryBtn, color: '#e2e2e5', borderColor: '#3c3c3f' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#a8c7fa')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#3c3c3f')}
            >↓ Save</button>
            <button onClick={handleRegenerate} style={{ ...secondaryBtn, color: '#e2e2e5', borderColor: '#3c3c3f' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#a8c7fa')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#3c3c3f')}
            >⟳ Regenerate</button>
            <button onClick={() => setLightbox(false)} style={{ ...secondaryBtn, color: '#8a8a8f', borderColor: '#3c3c3f' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3c3c3f')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#3c3c3f')}
            >✕ Close</button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #2f3033', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={handleSave}
          style={secondaryBtn}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#a8c7fa')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2f3033')}
        >
          ↓ Save
        </button>
        <button
          onClick={handleRegenerate}
          style={secondaryBtn}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#a8c7fa')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2f3033')}
        >
          ⟳ Regenerate
        </button>
        <button
          onClick={() => onDelete(item.id)}
          style={{ ...secondaryBtn, marginLeft: 'auto' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f28b82'; e.currentTarget.style.color = '#f28b82' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2f3033'; e.currentTarget.style.color = '#8a8a8f' }}
        >
          ✕ Delete
        </button>
      </div>
    </div>
  )
}
