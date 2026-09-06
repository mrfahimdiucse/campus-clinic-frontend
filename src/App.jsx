import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import FindDoctors from './pages/patient/FindDoctors';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorScheduleManager from './pages/doctor/DoctorScheduleManager';
import RiderDashboard from './pages/rider/RiderDashboard';
import Pharmacy from './pages/pharmacy/Pharmacy';
import Emergency from './pages/emergency/Emergency';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import MedicalChatbot from './components/common/MedicalChatbot';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<FindDoctors />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/emergency" element={<Emergency />} />

            {/* Protected Patient Routes */}
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* বুক অ্যাপয়েন্টমেন্ট রুট */}
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <FindDoctors />
                </ProtectedRoute>
              }
            />

            {/* Protected Doctor Dashboard */}
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Doctor Schedule Manager */}
            <Route
              path="/dashboard/doctor/schedule"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorScheduleManager />
                </ProtectedRoute>
              }
            />

            {/* Protected Rider Dashboard */}
            <Route
              path="/dashboard/rider"
              element={
                <ProtectedRoute allowedRoles={['rider']}>
                  <RiderDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MedicalChatbot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;