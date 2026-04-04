import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Home from './Home.jsx';
import Events from './Events.jsx'
import Attendance from './Attendance.jsx';
import PerEvent from './PerEvent.jsx'
import Masterlist from './Masterlist.jsx';
import FullAttendance from './FullAttendance.jsx';
import Login from './Login.jsx';

function Layout() {
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  return (
    <>
      {showHeader && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<PerEvent />} />
          <Route path="/event/:id/full-attendance" element={<FullAttendance />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/masterlist" element={<Masterlist />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;