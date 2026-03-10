import { useRef, useState } from 'react'

const MAX_SIZE = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export default function UploadZone({ onUpload, onClear, image }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  function processFile(file) {
    setError('')
    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPEG, PNG, or WEBP accepted.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File exceeds 10MB limit.')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      onUpload({ base64, mimeType: file.type, filename: file.name, dataUrl })
    }
    reader.readAsDataURL(file)
  }

  function onInputChange(e) {
    const file = e.target.files[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleClear() {
    setError('')
    onClear()
  }

  if (image) {
    return (
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#8a8a8f', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
          Source image
        </div>
        <div style={{ border: '1px solid #2f3033', borderRadius: 6, overflow: 'hidden' }}>
          <img
            src={image.dataUrl}
            alt={image.filename}
            style={{ width: '100%', display: 'block' }}
          />
          <div
            style={{
              padding: '8px 10px',
              borderTop: '1px solid #2f3033',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1e1f21',
            }}
          >
            <span style={{ fontSize: 12, color: '#55555a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
              {image.filename}
            </span>
            <button
              onClick={handleClear}
              style={{ fontSize: 12, color: '#8a8a8f', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#8a8a8f', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
        Source image
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `1px dashed ${dragging ? '#a8c7fa' : '#2f3033'}`,
          borderRadius: 6,
          padding: '28px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragging ? '#1a2236' : '#1e1f21',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: 13, color: '#8a8a8f' }}>
          Drop image here or <span style={{ color: '#a8c7fa' }}>browse</span>
        </div>
        <div style={{ fontSize: 12, color: '#3c3c3f', marginTop: 4 }}>JPEG · PNG · WEBP · max 10MB</div>
      </div>
      {error && <div style={{ fontSize: 12, color: '#f28b82', marginTop: 6 }}>{error}</div>}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onInputChange} style={{ display: 'none' }} />
    </div>
  )
}
