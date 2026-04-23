import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './TripCard.module.css';

function TripCard({ trip, onDelete }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{trip.title}</h3>
      <p className={styles.route}>
        {trip.origin} → {trip.destination}
      </p>
      <p className={styles.meta}>
        {trip.startDate} to {trip.endDate} | {trip.status}
      </p>
      <p className={styles.meta}>Budget: ${trip.budgetUsd.toFixed(2)}</p>
      <div className={styles.actions}>
        <Link className={styles.link} to={`/trips/${trip.id}`}>
          View
        </Link>
        <Link className={styles.link} to={`/trips/${trip.id}/edit`}>
          Edit
        </Link>
        <button className={styles.delete} type="button" onClick={() => onDelete(trip.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

TripCard.propTypes = {
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
  onDelete: PropTypes.func.isRequired,
};

export default TripCard;
