import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TripForm from './TripForm';
import styles from './TripFormPage.module.css';

function TripFormPage() {
  const navigate = useNavigate();

  function handleSubmitSuccess(createdTrip) {
    navigate(`/trips/${createdTrip.id}`);
  }

  return (
    <section className={styles.container}>
      <h2>Create Trip</h2>
      <TripForm mode="create" initialValues={null} onSubmitSuccess={handleSubmitSuccess} />
    </section>
  );
}

TripFormPage.propTypes = {};

export default TripFormPage;
