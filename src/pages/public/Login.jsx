import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bannerImg from '../../banner.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);

      if (loggedUser.role === 'rider') {
        navigate('/dashboard/rider');
      } else if (loggedUser.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else if (loggedUser.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (loggedUser.role === 'super_admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/patient');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-cover bg-center flex items-center justify-center relative px-4 py-12"
      style={{
        backgroundImage: `url(${bannerImg})`,
      }}
    >
      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"></div>

      {/* Login Card */}
      <div className="relative z-10 card max-w-md w-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/20">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center text-primary justify-center mb-1">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-gray-500 mb-4">
            Sign in to your CampusClinic account
          </p>

          {error && <div className="alert alert-error text-xs text-white mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label font-semibold text-xs">Email Address</label>
              <input
                type="email"
                required
                placeholder="rider@diu.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label font-semibold text-xs">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-white mt-4"
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;