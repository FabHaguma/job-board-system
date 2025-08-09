import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageJobs from './pages/ManageJobs';
import ViewApplications from './pages/ViewApplications';
import ViewAllApplications from './pages/ViewAllApplications';
import JobDetailPage from './pages/JobDetailPage';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="container">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={
              <ProtectedRoute adminRequired={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/manage-jobs" element={
              <ProtectedRoute adminRequired={true}>
                <ManageJobs />
              </ProtectedRoute>
            } />
            <Route path="/admin/all-applications" element={
              <ProtectedRoute adminRequired={true}>
                <ViewAllApplications />
              </ProtectedRoute>
            } />
            <Route path="/admin/applications/:jobId" element={
              <ProtectedRoute adminRequired={true}>
                <ViewApplications />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;