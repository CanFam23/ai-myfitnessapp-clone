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
