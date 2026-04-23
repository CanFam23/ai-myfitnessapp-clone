import PropTypes from 'prop-types';
import styles from './TripSummaryPanel.module.css';

function TripSummaryPanel({ trip }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.title}>{trip.title}</h2>
      <p className={styles.route}>
        {trip.origin} → {trip.destination}
      </p>
      <p className={styles.meta}>
        {trip.startDate} to {trip.endDate} | {trip.status}
      </p>
      <p className={styles.meta}>Budget: ${trip.budgetUsd.toFixed(2)}</p>
      <p className={styles.notes}>{trip.notes || 'No notes provided.'}</p>

      <h3>Stops</h3>
      {trip.stops.length === 0 ? (
        <p className={styles.meta}>No planned stops.</p>
      ) : (
        <ul className={styles.list}>
          {trip.stops.map((stop) => (
            <li key={stop}>{stop}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

TripSummaryPanel.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    origin: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    budgetUsd: PropTypes.number.isRequired,
    stops: PropTypes.arrayOf(PropTypes.string).isRequired,
    notes: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default TripSummaryPanel;
