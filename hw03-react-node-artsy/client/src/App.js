import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './overrides.css'; // Override Bootstrap styles
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Login from './components/Login';
import Register from './components/Register';
import Favorites from './components/Favorites';
import Footer from './components/Footer';
import NotificationContainer from './components/NotificationContainer';
import { useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Guest only route component (for login/register pages)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <NotificationContainer />
        <main className="flex-grow-1" style={{ paddingBottom: '50px' }}>
          <Routes>
            <Route path="/" element={<SearchBar />} />
            <Route path="/artist/:artistId" element={<SearchBar />} />
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;