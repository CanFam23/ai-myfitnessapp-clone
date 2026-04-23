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
