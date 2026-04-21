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
