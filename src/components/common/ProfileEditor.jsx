import { useState } from 'react';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const ProfileEditor = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', campusId: user?.campusId || '',
    hall: user?.hall || '', emergencyContact: user?.emergencyContact || '',
    allergies: user?.allergies || '', bloodGroup: user?.bloodGroup || '', zone: user?.zone || '', vehicleType: user?.vehicleType || '', profilePicture: user?.profilePicture || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > 2 * 1024 * 1024) return setError('Image must be smaller than 2MB.');
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      const response = await api.patch('/auth/profile', form);
      const nextUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    } finally { setSaving(false); }
  };

  return <div className="modal modal-open">
    <div className="modal-box max-w-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
      <h3 className="font-bold text-xl text-primary mb-4">Edit Profile</h3>
      {error && <div className="alert alert-error text-xs text-white mb-3">{error}</div>}
      <form onSubmit={save} className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="avatar placeholder"><div className="bg-primary text-white rounded-full w-16 h-16">{form.profilePicture ? <img src={form.profilePicture} alt="Profile" /> : <span>{form.name?.[0] || 'U'}</span>}</div></div>
          <input type="file" accept="image/*" onChange={handleImage} className="file-input file-input-bordered file-input-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['name', 'phone', ...(user?.role === 'patient' ? ['campusId', 'hall', 'bloodGroup', 'allergies', 'emergencyContact'] : []), ...(user?.role === 'rider' ? ['vehicleType', 'zone'] : [])].map((field) => <label key={field} className="form-control"><span className="label-text text-xs font-semibold capitalize">{field.replace(/([A-Z])/g, ' $1')}</span><input name={field} value={form[field] || ''} onChange={update} className="input input-bordered input-sm" /></label>)}
        </div>
        {user?.role === 'doctor' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="form-control"><span className="label-text text-xs font-semibold">Speciality</span><input name="specialization" placeholder="Speciality" onChange={update} className="input input-bordered input-sm" /></label><label className="form-control"><span className="label-text text-xs font-semibold">BMDC Registration</span><input name="bmdcRegistrationNumber" placeholder="BMDC number" onChange={update} className="input input-bordered input-sm" /></label><label className="form-control sm:col-span-2"><span className="label-text text-xs font-semibold">Education</span><input name="degrees" placeholder="MBBS, FCPS" onChange={(event) => setForm((current) => ({ ...current, degrees: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} className="input input-bordered input-sm" /></label></div>}
        <div className="modal-action"><button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button><button disabled={saving} className="btn btn-primary btn-sm text-white">{saving ? 'Saving...' : 'Save Profile'}</button></div>
      </form>
    </div>
  </div>;
};
export default ProfileEditor;
