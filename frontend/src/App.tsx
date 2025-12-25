import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientGallery from './pages/ClientGallery';
import Gallery from './pages/Gallery';
import Favorites from './pages/Favorites';
import './App.css';

function App() {
  const { photographer, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={photographer ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/client/:clientId"
          element={photographer ? <ClientGallery /> : <Navigate to="/login" />}
        />
        <Route path="/gallery/:uniqueLink" element={<Gallery />} />
        <Route path="/gallery/:uniqueLink/favorites" element={<Favorites />} />
        <Route
          path="/"
          element={<Navigate to={photographer ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
