import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getTripById } from '../services/api';
import TripSummaryPanel from './TripSummaryPanel';
import styles from './TripDetailsPage.module.css';

function TripDetailsPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTrip() {
      setLoading(true);
      setError('');
      try {
        const data = await getTripById(id);
        setTrip(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [id]);

  if (loading) {
    return <p className={styles.stateText}>Loading trip details...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  if (!trip) {
    return <p className={styles.errorText}>Trip not found.</p>;
  }

  return (
    <section className={styles.container}>
      <TripSummaryPanel trip={trip} />
    </section>
  );
}

TripDetailsPage.propTypes = {};

export default TripDetailsPage;
