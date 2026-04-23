import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { createTrip, updateTrip } from '../services/api';
import styles from './TripForm.module.css';

const defaultValues = {
  title: '',
  origin: '',
  destination: '',
  startDate: '',
  endDate: '',
  stopsText: '',
  budgetUsd: '0',
  status: 'planned',
  notes: '',
};

function toFormValues(trip) {
  if (!trip) {
    return defaultValues;
  }

  return {
    title: trip.title,
    origin: trip.origin,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    stopsText: trip.stops.join(', '),
    budgetUsd: String(trip.budgetUsd),
    status: trip.status,
    notes: trip.notes,
  };
}

function TripForm({ mode, initialValues, onSubmitSuccess }) {
  const [values, setValues] = useState(toFormValues(initialValues));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(toFormValues(initialValues));
  }, [initialValues]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      title: values.title.trim(),
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      stops: values.stopsText
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      budgetUsd: Number(values.budgetUsd),
      status: values.status,
      notes: values.notes.trim(),
    };

    try {
      const trip =
        mode === 'create'
          ? await createTrip(payload)
          : await updateTrip(initialValues.id, payload);
      onSubmitSuccess(trip);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.errorText}>Error: {error}</p>}

      <label className={styles.field}>
        Title
        <input name="title" value={values.title} onChange={updateField} required />
      </label>

      <label className={styles.field}>
        Origin
        <input name="origin" value={values.origin} onChange={updateField} required />
      </label>

      <label className={styles.field}>
        Destination
        <input
          name="destination"
          value={values.destination}
          onChange={updateField}
          required
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          Start Date
          <input
            type="date"
            name="startDate"
            value={values.startDate}
            onChange={updateField}
            required
          />
        </label>

        <label className={styles.field}>
          End Date
          <input
            type="date"
            name="endDate"
            value={values.endDate}
            onChange={updateField}
            required
          />
        </label>
      </div>

      <label className={styles.field}>
        Stops (comma-separated)
        <input name="stopsText" value={values.stopsText} onChange={updateField} />
      </label>

      <label className={styles.field}>
        Budget (USD)
        <input
          type="number"
          min="0"
          step="0.01"
          name="budgetUsd"
          value={values.budgetUsd}
          onChange={updateField}
          required
        />
      </label>

      <label className={styles.field}>
        Status
        <select name="status" value={values.status} onChange={updateField}>
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <label className={styles.field}>
        Notes
        <textarea name="notes" value={values.notes} onChange={updateField} rows="4" />
      </label>

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : mode === 'create' ? 'Create Trip' : 'Save Changes'}
      </button>
    </form>
  );
}

TripForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    origin: PropTypes.string,
    destination: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    stops: PropTypes.arrayOf(PropTypes.string),
    budgetUsd: PropTypes.number,
    status: PropTypes.string,
    notes: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onSubmitSuccess: PropTypes.func.isRequired,
};

TripForm.defaultProps = {
  initialValues: null,
};

export default TripForm;
