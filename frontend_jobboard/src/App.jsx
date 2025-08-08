import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import JobDetailPage from './pages/JobDetailPage';
// Simple Header for navigation
const Header = () => {
    return (
        <nav style={{ background: '#eee', padding: '1rem', marginBottom: '1rem' }}>
            <a href="/" style={{ marginRight: '1rem' }}>Home</a>
            <a href="/login" style={{ marginRight: '1rem' }}>Login</a>
            <a href="/register" style={{ marginRight: '1rem' }}>Register</a>
            <a href="/admin">Admin</a>
        </nav>
    )
}

function App() {
  return (
    <Router>
      <div className="container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          {/* Add more routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;