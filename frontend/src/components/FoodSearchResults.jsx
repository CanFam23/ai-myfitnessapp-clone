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
