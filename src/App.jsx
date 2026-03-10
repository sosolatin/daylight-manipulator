import { useState } from 'react'
import PasswordGate from './components/PasswordGate.jsx'
import LeftColumn from './components/LeftColumn.jsx'
import RightColumn from './components/RightColumn.jsx'
import UploadZone from './components/UploadZone.jsx'
import TimeSelector from './components/TimeSelector.jsx'
import ConvertButton from './components/ConvertButton.jsx'
import FeedHeader from './components/FeedHeader.jsx'
import ImageCard from './components/ImageCard.jsx'
import ImagePreloader from './components/ImagePreloader.jsx'
import { useFeed } from './hooks/useFeed.js'
import { generateConvertedImage } from './api/geminiImageGen.js'
import { addImage, deleteImage, clearAll as clearAllDB } from './storage/imageStore.js'

function buildFilename(timeOfDay) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`
  return `saffire-${timeOfDay}-${date}-${time}.png`
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem('toolPassword'))

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  const { feed, addPreloader, replacePreloader, removePreloader, removeFromFeed, clearFeed } = useFeed()
  const [image, setImage] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const imageCount = feed.filter(item => item.type === 'image').length
  const canConvert = !!image && !!selectedTime && !loading

  async function handleConvert(overrideImage, overrideTime) {
    const src = overrideImage || image
    const time = overrideTime || selectedTime
    if (!src || !time) return

    setError('')
    setLoading(true)

    const tempId = crypto.randomUUID()
    addPreloader(tempId, {
      sourceDataUrl: src.dataUrl,
      timeOfDay: time,
    })

    try {
      const generatedBase64 = await generateConvertedImage(
        src.base64,
        src.mimeType,
        time,
      )

      const record = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourceImageBase64: src.base64,
        sourceMimeType: src.mimeType,
        generatedImageBase64: generatedBase64,
        timeOfDay: time,
        filename: buildFilename(time),
      }

      await addImage(record)
      replacePreloader(tempId, record)
    } catch (err) {
      removePreloader(tempId)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleRegenerate({ sourceBase64, sourceMimeType, sourceDataUrl, timeOfDay }) {
    const src = { base64: sourceBase64, mimeType: sourceMimeType, dataUrl: sourceDataUrl }
    handleConvert(src, timeOfDay)
  }

  async function handleDelete(id) {
    await deleteImage(id)
    removeFromFeed(id)
  }

  async function handleClearAll() {
    await clearAllDB()
    clearFeed()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#131315' }}>
      <LeftColumn>
        <UploadZone image={image} onUpload={setImage} onClear={() => setImage(null)} />
        <TimeSelector selected={selectedTime} onChange={setSelectedTime} />

        {error && (
          <div
            style={{
              fontSize: 12,
              color: '#f28b82',
              padding: '10px 12px',
              border: '1px solid #3a1f1f',
              borderRadius: 4,
              backgroundColor: '#1a1212',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <ConvertButton
            onClick={() => handleConvert()}
            disabled={!canConvert}
            loading={loading}
          />
        </div>
      </LeftColumn>

      <RightColumn>
        <FeedHeader count={imageCount} onClearAll={handleClearAll} />

        {feed.length === 0 && (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              color: '#cccccc',
              fontSize: 13,
            }}
          >
            Converted images will appear here.
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '16px 24px 32px',
          }}
        >
          {feed.map(item =>
            item.type === 'preloader' ? (
              <ImagePreloader
                key={item.id}
                sourceDataUrl={item.sourceDataUrl}
                timeOfDay={item.timeOfDay}
              />
            ) : (
              <ImageCard key={item.id} item={item} onRegenerate={handleRegenerate} onDelete={handleDelete} />
            ),
          )}
        </div>
      </RightColumn>
    </div>
  )
}
