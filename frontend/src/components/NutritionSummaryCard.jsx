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
