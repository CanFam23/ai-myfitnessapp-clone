import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getTripById } from '../services/api';
import TripForm from './TripForm';
import styles from './TripEditPage.module.css';

function TripEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  function handleSubmitSuccess(updatedTrip) {
    navigate(`/trips/${updatedTrip.id}`);
  }

  if (loading) {
    return <p className={styles.stateText}>Loading trip for edit...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  if (!trip) {
    return <p className={styles.errorText}>Trip not found.</p>;
  }

  return (
    <section className={styles.container}>
      <h2>Edit Trip</h2>
      <TripForm mode="edit" initialValues={trip} onSubmitSuccess={handleSubmitSuccess} />
    </section>
  );
}

TripEditPage.propTypes = {};

export default TripEditPage;
