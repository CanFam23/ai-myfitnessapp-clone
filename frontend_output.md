```json
// FILE: frontend/package.json
{
  "name": "road-trip-planner-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "prop-types": "^15.8.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.10"
  }
}
```
This file defines the React + Vite package configuration and scripts.

```javascript
// FILE: frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```
This file configures Vite with the React plugin and API proxy for local development.

```javascript
// FILE: frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```
This file mounts the application and wraps it with React Router.

```javascript
// FILE: frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import TripListPage from './components/TripListPage';
import TripFormPage from './components/TripFormPage';
import TripDetailsPage from './components/TripDetailsPage';
import TripEditPage from './components/TripEditPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<TripListPage />} />
        <Route path="trips/new" element={<TripFormPage />} />
        <Route path="trips/:id" element={<TripDetailsPage />} />
        <Route path="trips/:id/edit" element={<TripEditPage />} />
      </Route>
    </Routes>
  );
}

export default App;
```
This file declares all routes from the component tree.

```javascript
// FILE: frontend/src/services/api.js
const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

async function handleResponse(response, fallbackMessage) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error || `${fallbackMessage} (HTTP ${response.status})`;
    throw new Error(message);
  }

  return payload;
}

// GET /api/trips - lists trips, optionally filtered by status
export async function getTrips(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`/api/trips${query}`);
  return handleResponse(response, 'Failed to load trips');
}

// GET /api/trips/upcoming - lists upcoming planned trips
export async function getUpcomingTrips() {
  const response = await fetch('/api/trips/upcoming');
  return handleResponse(response, 'Failed to load upcoming trips');
}

// GET /api/trips/{id} - fetches one trip by id
export async function getTripById(id) {
  const response = await fetch(`/api/trips/${id}`);
  return handleResponse(response, `Failed to load trip ${id}`);
}

// POST /api/trips - creates a new trip
export async function createTrip(body) {
  const response = await fetch('/api/trips', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return handleResponse(response, 'Failed to create trip');
}

// PUT /api/trips/{id} - updates an existing trip
export async function updateTrip(id, body) {
  const response = await fetch(`/api/trips/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return handleResponse(response, `Failed to update trip ${id}`);
}

// DELETE /api/trips/{id} - deletes a trip by id
export async function deleteTrip(id) {
  const response = await fetch(`/api/trips/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    const message = payload?.error || `Failed to delete trip ${id} (HTTP ${response.status})`;
    throw new Error(message);
  }
}
```
This file provides one API helper function for each endpoint in the API spec.

```javascript
// FILE: frontend/src/components/AppLayout.jsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './AppLayout.module.css';

function AppLayout() {
  const location = useLocation();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Road Trip Planner</h1>
        <nav className={styles.nav}>
          <Link className={styles.link} to="/">
            Trips
          </Link>
          <Link className={styles.link} to="/trips/new">
            Plan New Trip
          </Link>
        </nav>
        <p className={styles.context}>Current route: {location.pathname}</p>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

AppLayout.propTypes = {};

export default AppLayout;
```
This file provides a shared layout and navigation for all routes.

```css
/* FILE: frontend/src/components/AppLayout.module.css */
.shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.header {
  border-bottom: 1px solid #dbeafe;
  background: #ffffff;
  padding: 1rem 1.5rem;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.nav {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}

.link {
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
}

.context {
  color: #334155;
  margin: 0.5rem 0 0;
}

.main {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}
```
This file styles the shared app shell and navigation.

```javascript
// FILE: frontend/src/components/TripListPage.jsx
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
```
This file fetches list data, applies filters, and coordinates trip deletion.

```css
/* FILE: frontend/src/components/TripListPage.module.css */
.container {
  display: grid;
  gap: 1rem;
}

.summaryCard {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 1rem;
}

.upcomingList {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
}

.stateText {
  color: #334155;
  font-size: 1rem;
}

.errorText {
  color: #b91c1c;
  font-weight: 600;
}
```
This file styles the trip list page, summary section, and state messages.

```javascript
// FILE: frontend/src/components/TripFilterBar.jsx
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
```
This file renders filter controls that drive `GET /api/trips` query behavior.

```css
/* FILE: frontend/src/components/TripFilterBar.module.css */
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.75rem;
}

.label {
  font-weight: 600;
  color: #0f172a;
}

.select {
  border: 1px solid #94a3b8;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
}

.button {
  border: none;
  background: #2563eb;
  color: #ffffff;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
}
```
This file provides styles for the list filtering UI.

```javascript
// FILE: frontend/src/components/TripCardList.jsx
import PropTypes from 'prop-types';
import TripCard from './TripCard';
import styles from './TripCardList.module.css';

function TripCardList({ trips, onDelete }) {
  if (trips.length === 0) {
    return <p className={styles.empty}>No trips found for this filter.</p>;
  }

  return (
    <div className={styles.grid}>
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} onDelete={onDelete} />
      ))}
    </div>
  );
}

TripCardList.propTypes = {
  trips: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TripCardList;
```
This file renders a list of trip cards from API response data.

```css
/* FILE: frontend/src/components/TripCardList.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.empty {
  background: #ffffff;
  border: 1px dashed #94a3b8;
  border-radius: 10px;
  padding: 1rem;
  color: #475569;
}

.cardWrap {
  display: block;
}
```
This file styles the responsive layout for trip cards and empty state.

```javascript
// FILE: frontend/src/components/TripCard.jsx
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
```
This file displays one trip summary card with actions for details, edit, and delete.

```css
/* FILE: frontend/src/components/TripCard.module.css */
.card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 1rem;
  display: grid;
  gap: 0.45rem;
}

.title {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.route {
  margin: 0;
  color: #1e293b;
}

.meta {
  margin: 0;
  color: #475569;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.link {
  text-decoration: none;
  color: #1d4ed8;
  font-weight: 600;
}

.delete {
  border: none;
  border-radius: 6px;
  background: #dc2626;
  color: #ffffff;
  padding: 0.35rem 0.65rem;
}
```
This file styles each trip card and its action controls.

```javascript
// FILE: frontend/src/components/TripDetailsPage.jsx
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
```
This file fetches a single trip and renders its details statefully.

```css
/* FILE: frontend/src/components/TripDetailsPage.module.css */
.container {
  display: grid;
  gap: 1rem;
}

.stateText {
  color: #334155;
}

.errorText {
  color: #b91c1c;
  font-weight: 600;
}
```
This file styles the detail page state messages.

```javascript
// FILE: frontend/src/components/TripSummaryPanel.jsx
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
```
This file presents all fields for a single trip record.

```css
/* FILE: frontend/src/components/TripSummaryPanel.module.css */
.panel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 1rem;
}

.title {
  margin-top: 0;
  color: #0f172a;
}

.route {
  color: #1e293b;
  font-weight: 600;
}

.meta {
  color: #475569;
}

.notes {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
}

.list {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
}
```
This file styles the trip details summary panel.

```javascript
// FILE: frontend/src/components/TripFormPage.jsx
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
```
This file renders the new-trip page and handles navigation after create.

```css
/* FILE: frontend/src/components/TripFormPage.module.css */
.container {
  display: grid;
  gap: 1rem;
}

.title {
  margin: 0;
  color: #0f172a;
}

.helper {
  color: #475569;
}
```
This file styles the create-trip page container.

```javascript
// FILE: frontend/src/components/TripEditPage.jsx
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
```
This file loads an existing trip and renders the edit form flow.

```css
/* FILE: frontend/src/components/TripEditPage.module.css */
.container {
  display: grid;
  gap: 1rem;
}

.stateText {
  color: #334155;
}

.errorText {
  color: #b91c1c;
  font-weight: 600;
}
```
This file styles the edit page state messaging and layout.

```javascript
// FILE: frontend/src/components/TripForm.jsx
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
```
This file handles create and edit submission flows for trip data.

```css
/* FILE: frontend/src/components/TripForm.module.css */
.form {
  display: grid;
  gap: 0.8rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 1rem;
}

.row {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: 0.35rem;
  color: #0f172a;
  font-weight: 600;
}

.field input,
.field textarea,
.field select {
  border: 1px solid #94a3b8;
  border-radius: 6px;
  padding: 0.5rem;
  font: inherit;
}

.submit {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
}

.errorText {
  color: #b91c1c;
  margin: 0;
}
```
This file styles form controls, layout, and submission states.

```css
/* FILE: frontend/src/index.css */
* {
  box-sizing: border-box;
  margin: 0;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
  line-height: 1.5;
}

a {
  color: inherit;
}

button,
input,
textarea,
select {
  font: inherit;
}
```
This file applies base reset and global typography styles.
