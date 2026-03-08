import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import SuperstoreLogin from './pages/SuperstoreLogin';
import SuperstoreAdmin from './pages/SuperstoreAdmin';
import SuperstoreUser from './pages/SuperstoreUser';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<SuperstoreLogin />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <SuperstoreAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/user"
            element={
              <PrivateRoute>
                <SuperstoreUser />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
