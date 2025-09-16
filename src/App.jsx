import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users';
import AdsPage from './pages/Ads';
import ReportsPage from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="ads" element={<AdsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;