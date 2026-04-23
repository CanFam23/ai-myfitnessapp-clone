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
