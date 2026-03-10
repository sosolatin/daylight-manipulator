export async function generateConvertedImage(sourceBase64, mimeType, targetTime) {
  const password = sessionStorage.getItem('toolPassword') || ''
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tool-password': password,
    },
    body: JSON.stringify({ sourceBase64, mimeType, targetTime }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Server error ${response.status}`)
  return data.imageBase64
}
