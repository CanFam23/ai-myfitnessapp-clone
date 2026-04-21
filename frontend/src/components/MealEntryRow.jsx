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
