import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Emergency = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://campus-clinic-backend-jmil.onrender.com/api/v1';
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: '',
    urgency: 'High',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/emergency`, formData);
      setSuccessMsg(res.data.message);
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        location: '',
        urgency: 'High',
        details: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit emergency request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Alert Header */}
      <div className="bg-error text-error-content p-6 rounded-2xl mb-8 shadow-md">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🚨 Emergency Support & Ambulance
        </h1>
        <p className="mt-1 text-sm opacity-90">
          Request immediate medical assistance or an ambulance on campus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hotline Contacts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Hotline Contacts</h2>
          
          <div className="card bg-base-100 border border-error/30 shadow-sm p-4">
            <h3 className="font-semibold text-lg text-error">Campus Medical Control</h3>
            <p className="text-2xl font-black mt-1 text-gray-800">+880 1700-000000</p>
            <p className="text-xs text-gray-500 mt-1">Available 24/7 for urgent consultations</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
            <h3 className="font-semibold text-lg text-primary">Campus Ambulance Service</h3>
            <p className="text-2xl font-black mt-1 text-gray-800">+880 1800-111222</p>
            <p className="text-xs text-gray-500 mt-1">Direct dispatch for emergency transport</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
            <h3 className="font-semibold text-lg text-gray-700">National Emergency Hotline</h3>
            <p className="text-2xl font-black mt-1 text-gray-800">999</p>
            <p className="text-xs text-gray-500 mt-1">Police, Fire, and Ambulance</p>
          </div>
        </div>

        {/* Emergency Ambulance Request Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Request Emergency Ambulance</h2>

            {successMsg && (
              <div className="alert alert-success text-white mb-6 font-semibold">
                <span>✓ {successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label font-medium">Patient / Contact Person Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label font-medium">Active Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label font-medium">Campus Location (Hall/Building & Room)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shahidullah Hall, Room 302"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label font-medium">Urgency Level</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="select select-bordered w-full font-semibold"
                  >
                    <option value="Moderate">Moderate (Stable Condition)</option>
                    <option value="High">High (Severe Illness / Severe Pain)</option>
                    <option value="Critical">Critical (Unconscious / Heavy Bleeding)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label font-medium">Brief Medical Issue (Optional)</label>
                <textarea
                  placeholder="Describe the medical situation..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="textarea textarea-bordered w-full h-24"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-error text-white w-full text-lg mt-4"
              >
                {loading ? 'Dispatching Request...' : '🚨 Request Emergency Ambulance'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;