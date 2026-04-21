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
