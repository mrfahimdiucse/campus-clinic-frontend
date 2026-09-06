import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

const Home = () => (
  <div className="py-12 text-center space-y-4">
    <h1 className="text-4xl font-extrabold text-primary">Welcome to CampusClinic</h1>
    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
      Centralized Healthcare System for Campus Community. Book appointments, request emergency ambulance, and access digital prescriptions seamlessly.
    </p>
  </div>
);

const PatientDashboard = () => (
  <div className="p-6 bg-base-100 rounded-box border border-base-200">
    <h1 className="text-2xl font-bold">Patient Dashboard</h1>
    <p className="text-base-content/70 mt-2">Welcome to your health portal.</p>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}