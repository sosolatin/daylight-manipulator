import { useState } from 'react'

export default function FeedHeader({ count, onClearAll }) {
  const [confirming, setConfirming] = useState(false)

  function handleClearClick() {
    if (confirming) {
      onClearAll()
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  return (
    <div
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid #2f3033',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        backgroundColor: '#131315',
        zIndex: 10,
      }}
    >
      <div>
        <span style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8a8a8f', fontWeight: 500 }}>
          {count} conversion{count !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: 12, color: '#2f3033', marginLeft: 10 }}>Newest first</span>
      </div>

      {count > 0 && (
        <button
          onClick={handleClearClick}
          onBlur={() => setConfirming(false)}
          style={{
            fontSize: 12,
            color: confirming ? '#f28b82' : '#3c3c3f',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {confirming ? 'Confirm clear' : 'Clear all'}
        </button>
      )}
    </div>
  )
}
