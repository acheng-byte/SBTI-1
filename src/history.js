const STORAGE_KEY = 'sbti_history'
const MAX_RECORDS = 20

export function saveHistory(record) {
  try {
    const list = loadHistory()
    list.push(record)
    if (list.length > MAX_RECORDS) list.splice(0, list.length - MAX_RECORDS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    // localStorage unavailable
  }
}

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {}
}
