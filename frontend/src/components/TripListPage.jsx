import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { deleteTrip, getTrips, getUpcomingTrips } from '../services/api';
import TripFilterBar from './TripFilterBar';
import TripCardList from './TripCardList';
import styles from './TripListPage.module.css';

function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [allTrips, upcoming] = await Promise.all([
        getTrips(statusFilter),
        getUpcomingTrips(),
      ]);
      setTrips(allTrips);
      setUpcomingTrips(upcoming);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  async function handleDelete(id) {
    setError('');
    try {
      await deleteTrip(id);
      await loadTrips();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className={styles.stateText}>Loading trips...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  return (
    <section className={styles.container}>
      <TripFilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={loadTrips}
      />

      <div className={styles.summaryCard}>
        <h2>Upcoming Trips</h2>
        {upcomingTrips.length === 0 ? (
          <p>No upcoming planned trips.</p>
        ) : (
          <ul className={styles.upcomingList}>
            {upcomingTrips.map((trip) => (
              <li key={trip.id}>
                {trip.title} ({trip.startDate} to {trip.endDate})
              </li>
            ))}
          </ul>
        )}
      </div>

      <TripCardList trips={trips} onDelete={handleDelete} />
    </section>
  );
}

TripListPage.propTypes = {};

export default TripListPage;
