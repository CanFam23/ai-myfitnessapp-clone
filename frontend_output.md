
```json
// FILE: frontend/package.json
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "prop-types": "^15.8.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

Declares all project dependencies and npm scripts for development, build, and preview.

```js
// FILE: frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

Configures Vite with the React plugin and a dev-server proxy that forwards all `/api` requests to the Kotlin backend on port 3001.

```jsx
// FILE: frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

Application entry point that mounts `<App />` inside a `BrowserRouter`.

```jsx
// FILE: frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import DailyLogPage from './components/DailyLogPage'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<DailyLogPage />} />
      </Routes>
    </>
  )
}

export default App
```

Root component that renders the persistent `NavBar` and declares the `/` route pointing to `DailyLogPage`.

```js
// FILE: frontend/src/services/api.js
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
```

Exports one async function per API endpoint; each throws a descriptive `Error` on non-2xx responses.

```jsx
// FILE: frontend/src/components/NavBar.jsx
import { useSearchParams } from 'react-router-dom'
import DatePicker from './DatePicker'
import styles from './NavBar.module.css'

const today = new Date().toISOString().split('T')[0]

function NavBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedDate = searchParams.get('date') || today

  function handleDateChange(date) {
    setSearchParams({ date })
  }

  return (
    <nav className={styles.nav}>
      <h1 className={styles.title}>Nutrition Tracker</h1>
      <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
    </nav>
  )
}

export default NavBar
```

Persistent top navigation bar that reads and writes the selected date via URL search params, passing it to `DatePicker`.

```css
/* FILE: frontend/src/components/NavBar.module.css */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  background-color: #1a73e8;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

Styles the navigation bar with a blue background, space-between flex layout, and a drop shadow.

```jsx
// FILE: frontend/src/components/DatePicker.jsx
import PropTypes from 'prop-types'
import styles from './DatePicker.module.css'

function DatePicker({ selectedDate, onDateChange }) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor="date-input" className={styles.label}>Date</label>
      <input
        id="date-input"
        type="date"
        value={selectedDate}
        onChange={e => onDateChange(e.target.value)}
        className={styles.input}
      />
    </div>
  )
}

DatePicker.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired
}

export default DatePicker
```

Controlled date input that calls `onDateChange` whenever the user selects a new date.

```css
/* FILE: frontend/src/components/DatePicker.module.css */
.wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}

.input {
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.input:focus {
  outline: none;
  border-color: white;
}
```

Styles the label and date input to blend into the blue navigation bar.

```jsx
// FILE: frontend/src/components/DailyLogPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEntries, getSummary } from '../services/api'
import NutritionSummaryCard from './NutritionSummaryCard'
import MealSection from './MealSection'
import styles from './DailyLogPage.module.css'

const today = new Date().toISOString().split('T')[0]
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

function DailyLogPage() {
  const [searchParams] = useSearchParams()
  const date = searchParams.get('date') || today

  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([getEntries(date), getSummary(date)])
      .then(([entriesData, summaryData]) => {
        if (!cancelled) {
          setEntries(entriesData.entries)
          setSummary(summaryData)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [date, refreshKey])

  if (loading) return <p className={styles.status}>Loading...</p>
  if (error) return <p className={styles.status}>Error: {error}</p>

  return (
    <main className={styles.main}>
      {summary && <NutritionSummaryCard summary={summary} />}
      <div className={styles.meals}>
        {MEAL_TYPES.map(mealType => (
          <MealSection
            key={mealType}
            mealType={mealType}
            entries={entries.filter(e => e.meal_type === mealType)}
            date={date}
            onEntryDeleted={refresh}
            onEntryUpdated={refresh}
            onEntryAdded={refresh}
          />
        ))}
      </div>
    </main>
  )
}

export default DailyLogPage
```

Main page that fetches entries and summary for the URL-param date and renders a `NutritionSummaryCard` plus one `MealSection` per meal type.

```css
/* FILE: frontend/src/components/DailyLogPage.module.css */
.main {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.status {
  text-align: center;
  margin-top: 3rem;
  font-size: 1rem;
  color: #666;
}

.meals {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
```

Centers and constrains the page content, spaces meal sections, and styles the loading/error text.

```jsx
// FILE: frontend/src/components/NutritionSummaryCard.jsx
import PropTypes from 'prop-types'
import styles from './NutritionSummaryCard.module.css'

function NutritionSummaryCard({ summary }) {
  const { total_calories, total_protein, total_carbs, total_fat } = summary

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Daily Totals</h2>
      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.value}>{Math.round(total_calories)}</span>
          <span className={styles.label}>Calories</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{total_protein.toFixed(1)}g</span>
          <span className={styles.label}>Protein</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{total_carbs.toFixed(1)}g</span>
          <span className={styles.label}>Carbs</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{total_fat.toFixed(1)}g</span>
          <span className={styles.label}>Fat</span>
        </div>
      </div>
    </div>
  )
}

NutritionSummaryCard.propTypes = {
  summary: PropTypes.shape({
    total_calories: PropTypes.number.isRequired,
    total_protein: PropTypes.number.isRequired,
    total_carbs: PropTypes.number.isRequired,
    total_fat: PropTypes.number.isRequired
  }).isRequired
}

export default NutritionSummaryCard
```

Displays the four aggregated daily nutrition totals passed via the `summary` prop.

```css
/* FILE: frontend/src/components/NutritionSummaryCard.module.css */
.card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.heading {
  font-size: 0.82rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a73e8;
}

.label {
  font-size: 0.78rem;
  color: #999;
  margin-top: 0.2rem;
}
```

Lays out the four nutrition totals in a four-column grid with prominent blue values.

```jsx
// FILE: frontend/src/components/MealSection.jsx
import PropTypes from 'prop-types'
import MealEntryRow from './MealEntryRow'
import AddFoodButton from './AddFoodButton'
import styles from './MealSection.module.css'

function MealSection({ mealType, entries, date, onEntryDeleted, onEntryUpdated, onEntryAdded }) {
  const title = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <AddFoodButton mealType={mealType} date={date} onEntryAdded={onEntryAdded} />
      </div>
      {entries.length === 0 ? (
        <p className={styles.empty}>No foods logged</p>
      ) : (
        <div className={styles.list}>
          {entries.map(entry => (
            <MealEntryRow
              key={entry.id}
              entry={entry}
              onDelete={onEntryDeleted}
              onUpdate={onEntryUpdated}
            />
          ))}
        </div>
      )}
    </section>
  )
}

MealSection.propTypes = {
  mealType: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  date: PropTypes.string.isRequired,
  onEntryDeleted: PropTypes.func.isRequired,
  onEntryUpdated: PropTypes.func.isRequired,
  onEntryAdded: PropTypes.func.isRequired
}

export default MealSection
```

Renders the meal header, all entry rows, and the "Add Food" button for a single meal type.

```css
/* FILE: frontend/src/components/MealSection.module.css */
.section {
  background: white;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
}

.empty {
  font-size: 0.88rem;
  color: #ccc;
  font-style: italic;
  padding: 0.3rem 0;
}

.list {
  display: flex;
  flex-direction: column;
}
```

Styles the meal card with a white rounded surface, flex header, and italic empty-state text.

```jsx
// FILE: frontend/src/components/MealEntryRow.jsx
import { useState } from 'react'
import PropTypes from 'prop-types'
import { updateEntry, deleteEntry } from '../services/api'
import styles from './MealEntryRow.module.css'

function MealEntryRow({ entry, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [quantity, setQuantity] = useState(String(entry.quantity_grams))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave() {
    const grams = parseFloat(quantity)
    if (isNaN(grams) || grams <= 0) {
      setError('Quantity must be > 0')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateEntry(entry.id, { quantity_grams: grams })
      setEditing(false)
      onUpdate(entry.id, grams)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditing(false)
    setQuantity(String(entry.quantity_grams))
    setError(null)
  }

  async function handleDelete() {
    try {
      await deleteEntry(entry.id)
      onDelete(entry.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.row}>
      <span className={styles.name}>{entry.food_name}</span>
      <span className={styles.quantity}>
        {editing ? (
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className={styles.qtyInput}
            min="0.1"
            step="1"
          />
        ) : (
          `${entry.quantity_grams}g`
        )}
      </span>
      <span className={styles.macros}>
        {Math.round(entry.calories)} cal &middot;{' '}
        {entry.protein.toFixed(1)}g P &middot;{' '}
        {entry.carbs.toFixed(1)}g C &middot;{' '}
        {entry.fat.toFixed(1)}g F
      </span>
      <span className={styles.actions}>
        {editing ? (
          <>
            <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className={styles.editBtn}>Edit</button>
            <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>
          </>
        )}
      </span>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

MealEntryRow.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    food_name: PropTypes.string.isRequired,
    quantity_grams: PropTypes.number.isRequired,
    calories: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default MealEntryRow
```

Displays one meal entry with inline quantity editing via `PUT /api/entries/{id}` and a delete button via `DELETE /api/entries/{id}`.

```css
/* FILE: frontend/src/components/MealEntryRow.module.css */
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f5f5f5;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.row:last-child {
  border-bottom: none;
}

.name {
  flex: 1;
  font-weight: 500;
  color: #333;
  min-width: 120px;
}

.quantity {
  width: 90px;
  color: #555;
}

.qtyInput {
  width: 68px;
  padding: 0.2rem 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.macros {
  color: #777;
  font-size: 0.82rem;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 0.35rem;
}

.editBtn, .saveBtn, .deleteBtn, .cancelBtn {
  padding: 0.2rem 0.55rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.editBtn   { background: #e8f0fe; color: #1a73e8; }
.saveBtn   { background: #e6f4ea; color: #1e8e3e; }
.deleteBtn { background: #fce8e6; color: #d93025; }
.cancelBtn { background: #f1f3f4; color: #555; }

.error {
  width: 100%;
  font-size: 0.8rem;
  color: #d93025;
}
```

Styles the entry row as a flex strip with color-coded action buttons and a divider between rows.

```jsx
// FILE: frontend/src/components/AddFoodButton.jsx
import { useState } from 'react'
import PropTypes from 'prop-types'
import FoodSearchModal from './FoodSearchModal'
import styles from './AddFoodButton.module.css'

function AddFoodButton({ mealType, date, onEntryAdded }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleEntryAdded() {
    setIsOpen(false)
    onEntryAdded()
  }

  return (
    <>
      <button className={styles.button} onClick={() => setIsOpen(true)}>
        + Add Food
      </button>
      {isOpen && (
        <FoodSearchModal
          mealType={mealType}
          date={date}
          onClose={() => setIsOpen(false)}
          onEntryAdded={handleEntryAdded}
        />
      )}
    </>
  )
}

AddFoodButton.propTypes = {
  mealType: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  onEntryAdded: PropTypes.func.isRequired
}

export default AddFoodButton
```

Manages the open/close state of `FoodSearchModal` and triggers a parent refresh after a food is logged.

```css
/* FILE: frontend/src/components/AddFoodButton.module.css */
.button {
  padding: 0.3rem 0.75rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  transition: background 0.15s;
}

.button:hover {
  background: #1557b0;
}

.button:active {
  background: #0d47a1;
}
```

Styles the add button with the brand blue color and hover/active transitions.

```jsx
// FILE: frontend/src/components/FoodSearchModal.jsx
import { useState } from 'react'
import PropTypes from 'prop-types'
import { searchFoods } from '../services/api'
import FoodSearchBar from './FoodSearchBar'
import FoodSearchResults from './FoodSearchResults'
import styles from './FoodSearchModal.module.css'

function FoodSearchModal({ mealType, date, onClose, onEntryAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleQueryChange(q) {
    setQuery(q)
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await searchFoods(q)
      setResults(data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Food — {mealLabel}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <FoodSearchBar query={query} onQueryChange={handleQueryChange} />
        {loading && <p className={styles.status}>Searching…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <FoodSearchResults
            results={results}
            mealType={mealType}
            date={date}
            onEntryAdded={onEntryAdded}
          />
        )}
      </div>
    </div>
  )
}

FoodSearchModal.propTypes = {
  mealType: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onEntryAdded: PropTypes.func.isRequired
}

export default FoodSearchModal
```

Full-screen modal overlay that manages search query state, calls `GET /api/foods`, and renders results.

```css
/* FILE: frontend/src/components/FoodSearchModal.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  width: min(520px, 92vw);
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
}

.closeBtn {
  background: none;
  border: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #888;
  padding: 0 0.2rem;
}

.closeBtn:hover {
  color: #333;
}

.status {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  padding: 1rem 0;
}

.error {
  color: #d93025;
  font-size: 0.88rem;
  padding: 0.5rem 0;
}
```

Styles the fixed overlay and centered, scrollable modal card with a prominent close button.

```jsx
// FILE: frontend/src/components/FoodSearchBar.jsx
import PropTypes from 'prop-types'
import styles from './FoodSearchBar.module.css'

function FoodSearchBar({ query, onQueryChange }) {
  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Search foods…"
        className={styles.input}
        autoFocus
      />
    </div>
  )
}

FoodSearchBar.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired
}

export default FoodSearchBar
```

Controlled text input that fires `onQueryChange` on every keystroke, letting the parent debounce and trigger the search.

```css
/* FILE: frontend/src/components/FoodSearchBar.module.css */
.wrapper {
  margin-bottom: 1rem;
}

.input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.12);
}

.input::placeholder {
  color: #bbb;
}
```

Styles the full-width search input with a rounded border and a blue focus ring.

```jsx
// FILE: frontend/src/components/FoodSearchResults.jsx
import PropTypes from 'prop-types'
import FoodResultItem from './FoodResultItem'
import styles from './FoodSearchResults.module.css'

function FoodSearchResults({ results, mealType, date, onEntryAdded }) {
  if (results.length === 0) return null

  return (
    <ul className={styles.list}>
      {results.map(food => (
        <FoodResultItem
          key={food.id}
          food={food}
          mealType={mealType}
          date={date}
          onEntryAdded={onEntryAdded}
        />
      ))}
    </ul>
  )
}

FoodSearchResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  mealType: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  onEntryAdded: PropTypes.func.isRequired
}

export default FoodSearchResults
```

Renders a list of `FoodResultItem` components for each food returned by the search API; returns nothing when the list is empty.

```css
/* FILE: frontend/src/components/FoodSearchResults.module.css */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list > li {
  border-top: 1px solid #f0f0f0;
}

.list > li:first-child {
  border-top: none;
}
```

Resets list styles and adds divider lines between result items, omitting the top border on the first item.

```jsx
// FILE: frontend/src/components/FoodResultItem.jsx
import { useState } from 'react'
import PropTypes from 'prop-types'
import { createEntry } from '../services/api'
import styles from './FoodResultItem.module.css'

function FoodResultItem({ food, mealType, date, onEntryAdded }) {
  const [quantity, setQuantity] = useState('100')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAdd() {
    const grams = parseFloat(quantity)
    if (isNaN(grams) || grams <= 0) {
      setError('Enter a quantity greater than 0')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await createEntry({ food_id: food.id, meal_type: mealType, quantity_grams: grams, date })
      onEntryAdded()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{food.name}</span>
        <span className={styles.macros}>
          {food.calories_per_100g} cal &middot; {food.protein_per_100g}g P &middot;{' '}
          {food.carbs_per_100g}g C &middot; {food.fat_per_100g}g F &nbsp;(per 100g)
        </span>
      </div>
      <div className={styles.addRow}>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className={styles.qtyInput}
          min="0.1"
          step="1"
          placeholder="g"
        />
        <span className={styles.unit}>g</span>
        <button onClick={handleAdd} disabled={loading} className={styles.addBtn}>
          {loading ? '…' : 'Add'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </li>
  )
}

FoodResultItem.propTypes = {
  food: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    calories_per_100g: PropTypes.number.isRequired,
    protein_per_100g: PropTypes.number.isRequired,
    carbs_per_100g: PropTypes.number.isRequired,
    fat_per_100g: PropTypes.number.isRequired
  }).isRequired,
  mealType: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  onEntryAdded: PropTypes.func.isRequired
}

export default FoodResultItem
```

Displays one food's name and per-100g macros, lets the user enter a gram quantity, and calls `POST /api/entries` on submit.

```css
/* FILE: frontend/src/components/FoodResultItem.module.css */
.item {
  padding: 0.75rem 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.5rem;
}

.name {
  font-weight: 500;
  color: #222;
  font-size: 0.95rem;
}

.macros {
  font-size: 0.8rem;
  color: #888;
}

.addRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qtyInput {
  width: 68px;
  padding: 0.3rem 0.45rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.unit {
  font-size: 0.85rem;
  color: #666;
}

.addBtn {
  padding: 0.3rem 0.8rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
}

.addBtn:hover:not(:disabled) {
  background: #1557b0;
}

.addBtn:disabled {
  background: #b0c4ef;
  cursor: not-allowed;
}

.error {
  font-size: 0.8rem;
  color: #d93025;
  margin: 0.3rem 0 0;
}
```

Styles the food result row with stacked info, an inline quantity input, and a blue add button.

```css
/* FILE: frontend/src/index.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
  background-color: #f1f3f4;
  color: #202124;
  line-height: 1.5;
}
```

Global CSS reset and base body styles shared across the entire application.
