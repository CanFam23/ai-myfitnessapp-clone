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
