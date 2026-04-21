const BASE = '/api'

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// GET /api/foods?q= — search the food database by name
export async function searchFoods(q) {
  const res = await fetch(`${BASE}/foods?q=${encodeURIComponent(q)}`)
  return handleResponse(res)
}

// GET /api/foods/{id} — retrieve a single food item by ID
export async function getFoodById(id) {
  const res = await fetch(`${BASE}/foods/${id}`)
  return handleResponse(res)
}

// GET /api/entries?date= — retrieve all meal entries for a given date
export async function getEntries(date) {
  const res = await fetch(`${BASE}/entries?date=${encodeURIComponent(date)}`)
  return handleResponse(res)
}

// POST /api/entries — log a new meal entry, returns the created entry
export async function createEntry(data) {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

// PUT /api/entries/{id} — update the quantity of an existing meal entry
export async function updateEntry(id, data) {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

// DELETE /api/entries/{id} — remove a meal entry
export async function deleteEntry(id) {
  const res = await fetch(`${BASE}/entries/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

// GET /api/summary?date= — retrieve aggregated daily nutrition totals
export async function getSummary(date) {
  const res = await fetch(`${BASE}/summary?date=${encodeURIComponent(date)}`)
  return handleResponse(res)
}
