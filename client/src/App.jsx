import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import DiseaseDetector from './pages/DiseaseDetector';
import MandiPrices from './pages/MandiPrices';
import WeatherAdvisor from './pages/WeatherAdvisor';
import AddCrop from './pages/AddCrop';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-green-600 text-lg">Loading FarmSense...</div></div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<Chatbot />} />
            <Route path="disease" element={<DiseaseDetector />} />
            <Route path="prices" element={<MandiPrices />} />
            <Route path="weather" element={<WeatherAdvisor />} />
            <Route path="add-crop" element={<AddCrop />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
