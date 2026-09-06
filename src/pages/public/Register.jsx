import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bannerImg from '../../banner.jpg';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    campusId: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newUser = await register(formData);

      if (newUser?.role === 'rider') {
        navigate('/dashboard/rider');
      } else if (newUser?.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else if (newUser?.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (newUser?.role === 'super_admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/patient');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration service is unavailable. Please check the database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-cover bg-center flex items-center justify-center relative px-4 py-8"
      style={{
        backgroundImage: `url(${bannerImg})`,
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"></div>

      {/* Register Form Card */}
      <div className="relative z-10 card max-w-xl w-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 my-4">
        <div className="card-body p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-1">
            Create an Account
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Join CampusClinic healthcare network
          </p>

          {error && (
            <div className="alert alert-error text-xs text-white mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label font-semibold text-xs text-gray-700 pb-1">Full Name</label>
              <div className="relative flex items-center">
                <svg className="w-5 h-5 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="MD. SADIK HASAN FAHIM"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            {/* Email & Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label font-semibold text-xs text-gray-700 pb-1">Email Address</label>
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="hasan241-15-465@diu.edu.bd"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="label font-semibold text-xs text-gray-700 pb-1">Password</label>
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Role & Campus ID Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label font-semibold text-xs text-gray-700 pb-1">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="select select-bordered w-full font-medium"
                >
                  <option value="patient">Patient (Student/Staff)</option>
                  <option value="doctor">Doctor</option>
                  <option value="rider">Delivery Rider 🚴</option>
                </select>
              </div>

              <div>
                <label className="label font-semibold text-xs text-gray-700 pb-1">Campus ID</label>
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0a2 2 0 100-4 2 2 0 000 4zm0 0v2m0 4h.01" />
                  </svg>
                  <input
                    type="text"
                    name="campusId"
                    placeholder="1234"
                    value={formData.campusId}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="label font-semibold text-xs text-gray-700 pb-1">Phone Number</label>
              <div className="relative flex items-center">
                <svg className="w-5 h-5 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+8801572988084"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-white mt-4 font-semibold text-base"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;