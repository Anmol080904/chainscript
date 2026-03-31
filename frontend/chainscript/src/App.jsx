import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostEditor from './pages/PostEditor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ShareViewer from './pages/ShareViewer';
import ForgotPassword from './pages/ForgotPassword';
import VersionHistory from './pages/VersionHistory';
import VersionDetail from './pages/VersionDetail';
import VerifyVersion from './pages/VerifyVersion';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a nice full-screen loader
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// Public Route Wrapper (prevent logged in users from seeing login again)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          {/* Public Share Route */}
          <Route path="/share/:token" element={<ShareViewer />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/editor/:id?" element={
            <ProtectedRoute>
              <PostEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/posts/:id/versions" element={
            <ProtectedRoute>
              <VersionHistory />
            </ProtectedRoute>
          } />

          <Route path="/posts/:id/versions/:n" element={
            <ProtectedRoute>
               <VersionDetail />
            </ProtectedRoute>
          } />

          <Route path="/versions/:versionId/verify" element={
            <ProtectedRoute>
               <VerifyVersion />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
