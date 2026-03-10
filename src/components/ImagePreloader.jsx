import { useEffect, useState } from 'react'
import { TIME_OPTIONS } from './TimeSelector.jsx'

export default function ImagePreloader({ sourceDataUrl, timeOfDay }) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const timeOption = TIME_OPTIONS.find(o => o.value === timeOfDay)

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
        {sourceDataUrl && (
          <img
            src={sourceDataUrl}
            alt="source"
            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 3, border: '1px solid #2f3033' }}
          />
        )}
        <div>
          <div style={{ fontSize: 13, color: '#e2e2e5', fontWeight: 500 }}>
            {timeOption?.label || timeOfDay}
          </div>
          <div style={{ fontSize: 11, color: '#55555a', marginTop: 1 }}>
            Generating{dots}
          </div>
        </div>
      </div>

      {/* Shimmer skeleton */}
      <div
        style={{
          height: 240,
          background: 'linear-gradient(90deg, #1e1f21 25%, #282a2c 50%, #1e1f21 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
