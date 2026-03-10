import { useState } from 'react'

const STORAGE_KEY = 'saffire_gemini_api_key'

export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '')

  function saveKey(key) {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKey(key)
  }

  function clearKey() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey('')
  }

  return { apiKey, saveKey, clearKey }
}
