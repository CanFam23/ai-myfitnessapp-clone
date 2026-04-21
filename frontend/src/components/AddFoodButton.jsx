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
