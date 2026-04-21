import { useSearchParams } from 'react-router-dom'
import DatePicker from './DatePicker'
import styles from './NavBar.module.css'

const today = new Date().toISOString().split('T')[0]

function NavBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedDate = searchParams.get('date') || today

  function handleDateChange(date) {
    setSearchParams({ date })
  }

  return (
    <nav className={styles.nav}>
      <h1 className={styles.title}>Nutrition Tracker</h1>
      <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
    </nav>
  )
}

export default NavBar
