import PropTypes from 'prop-types';
import styles from './TripFilterBar.module.css';

function TripFilterBar({ statusFilter, onStatusChange, onRefresh }) {
  return (
    <div className={styles.row}>
      <label className={styles.label} htmlFor="status-filter">
        Status
      </label>
      <select
        id="status-filter"
        className={styles.select}
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="">All</option>
        <option value="planned">Planned</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button className={styles.button} type="button" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}

TripFilterBar.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default TripFilterBar;
