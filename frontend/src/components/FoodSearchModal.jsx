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
