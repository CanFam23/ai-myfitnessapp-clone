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
