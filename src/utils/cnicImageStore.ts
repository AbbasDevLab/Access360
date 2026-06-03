/**
 * Local cache of CNIC images keyed by visit id.
 *
 * Used as a fallback when the backend's `GuestVisit.ImagePath` column is too
 * small to hold the embedded base64 we send. We previously stored these in
 * `localStorage`, but the 5 MB per-origin quota fills up after ~30–50
 * check-ins, after which saves silently fail and the "View CNIC" button
 * shows nothing.
 *
 * IndexedDB has a much higher quota (typically a percentage of free disk),
 * survives browser storage pressure better, and is the right home for blobs
 * of this size. We also migrate any legacy `localStorage` entries here on
 * first read so historical data isn't lost.
 */

const DB_NAME = 'access360'
const DB_VERSION = 1
const STORE = 'cnicImages'
const LEGACY_PREFIX = 'access360.cnicImages.'

export interface CnicImagePair {
  front?: string | null
  back?: string | null
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbPromise = null
      reject(req.error)
    }
  })
  return dbPromise
}

export async function saveCnicImages(
  visitId: string | number,
  pair: CnicImagePair,
): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(pair, String(visitId))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Last-ditch fallback: stash in localStorage so the data exists
    // somewhere on the device. Will only succeed if there's still quota.
    try {
      localStorage.setItem(
        `${LEGACY_PREFIX}${visitId}`,
        JSON.stringify(pair),
      )
    } catch {
      // Nothing more we can do without backend support.
    }
  }
}

/** Read every stored CNIC pair from IDB + any legacy localStorage entries.
 *  Returns a Map<visitId, CnicImagePair>. IDB wins ties. Best-effort: any
 *  error returns whatever has been collected so far. */
export async function loadAllCnicImages(): Promise<Map<string, CnicImagePair>> {
  const result = new Map<string, CnicImagePair>()

  // Legacy localStorage entries first so IDB can override them on conflict.
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(LEGACY_PREFIX)) continue
      const id = key.substring(LEGACY_PREFIX.length)
      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw) as { front?: unknown; back?: unknown }
        result.set(id, {
          front: typeof parsed.front === 'string' ? parsed.front : null,
          back: typeof parsed.back === 'string' ? parsed.back : null,
        })
      } catch {
        // skip malformed
      }
    }
  } catch {
    // localStorage may be unavailable in some embedded webviews.
  }

  // IDB entries.
  try {
    const db = await openDb()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readonly')
      const store = tx.objectStore(STORE)
      const req = store.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (!cursor) return
        const id = String(cursor.key)
        result.set(id, cursor.value as CnicImagePair)
        cursor.continue()
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // No IDB → just return what localStorage had.
  }

  return result
}

/** Copy any legacy `localStorage` entries into IDB. Once an entry is in IDB
 *  it survives the localStorage quota filling up. We leave the localStorage
 *  copies in place so older app builds on the same device still find them. */
export async function migrateLegacyLocalStorage(): Promise<void> {
  let entries: Array<[string, CnicImagePair]> = []
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(LEGACY_PREFIX)) continue
      const id = key.substring(LEGACY_PREFIX.length)
      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw) as CnicImagePair
        entries.push([id, parsed])
      } catch {
        // skip malformed
      }
    }
  } catch {
    return
  }
  if (entries.length === 0) return
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      for (const [id, pair] of entries) store.put(pair, id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // best-effort
  }
}

/** Ask the browser to mark our origin as "persistent" so the cache survives
 *  storage pressure. Returns whether the request succeeded. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      return await navigator.storage.persist()
    }
  } catch {
    // ignore
  }
  return false
}
