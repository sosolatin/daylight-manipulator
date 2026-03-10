import { openDB } from 'idb'

const DB_NAME = 'saffire-daylight'
const STORE_NAME = 'images'
const VERSION = 1
const MAX_ITEMS = 50

function getDB() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      store.createIndex('timestamp', 'timestamp')
    },
  })
}

/**
 * Add a new image record. Prunes oldest if over 50-item cap.
 * @param {{ id, timestamp, sourceImageBase64, sourceMimeType, generatedImageBase64, timeOfDay, filename }} record
 */
export async function addImage(record) {
  const db = await getDB()
  await db.put(STORE_NAME, record)

  // Prune oldest if over cap
  const all = await db.getAllFromIndex(STORE_NAME, 'timestamp')
  if (all.length > MAX_ITEMS) {
    const toDelete = all.slice(0, all.length - MAX_ITEMS)
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await Promise.all(toDelete.map(item => tx.store.delete(item.id)))
    await tx.done
  }
}

/** Get all images, newest first */
export async function getAllImages() {
  const db = await getDB()
  const all = await db.getAllFromIndex(STORE_NAME, 'timestamp')
  return all.reverse()
}

export async function deleteImage(id) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearAll() {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/** Returns storage estimate string e.g. "~14MB used" */
export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) return null
  const { usage } = await navigator.storage.estimate()
  if (usage == null) return null
  const mb = (usage / 1024 / 1024).toFixed(1)
  return `~${mb}MB used`
}
