import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../../config/axios';
import EmptyState from '../../components/common/EmptyState';

const modules = [
  ['inventory', 'Pharmacy & Inventory'],
  ['outbreaks', 'Outbreak Radar'],
  ['doctors', 'Doctor Verification'],
  ['records', 'Health Records'],
  ['queue', 'Consultation Queue'],
  ['emergency', 'Emergency Response'],
  ['finance', 'Finance & Accounting'],
  ['audit', 'RBAC & Audit Logs'],
];

const emptyMedicine = { 
  name: '', 
  genericName: '', 
  category: '', 
  stock: 0, 
  price: 0, 
  batchNumber: '', 
  expiryDate: '', 
  lowStockThreshold: 10 
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [users, setUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [form, setForm] = useState(emptyMedicine);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [alertForm, setAlertForm] = useState({ title: '', message: '', area: 'Campus-wide', severity: 'Info' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const notify = (message) => { 
    setNotice(message); 
    window.setTimeout(() => setNotice(''), 2500); 
  };

  const loadBase = useCallback(async () => {
    try {
      setError('');
      const [summary, chart, userResponse, inventoryResponse, doctorResponse] = await Promise.all([
        api.get('/admin/overview'), 
        api.get('/admin/analytics/appointments'), 
        api.get('/admin/users'), 
        api.get('/admin/inventory'), 
        api.get('/admin/doctors/verification'),
      ]);
      setOverview(summary.data?.data || null); 
      setAnalytics(chart.data?.data || []); 
      setUsers(userResponse.data?.data || []); 
      setInventory(inventoryResponse.data?.data || []); 
      setDoctors(doctorResponse.data?.data || []);
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to load admin data.'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadBase(); }, [loadBase]);

  const moduleEndpoints = { 
    queue: '/admin/appointments', 
    emergency: '/admin/emergencies', 
    records: '/admin/health-records', 
    finance: '/admin/finance/summary', 
    audit: '/admin/audit-logs', 
    outbreaks: '/admin/outbreaks' 
  };

  useEffect(() => {
    if (!moduleEndpoints[tab]) return undefined;
    let active = true; 
    setModuleLoading(true);
    api.get(moduleEndpoints[tab], tab === 'records' && search ? { params: { search } } : {})
      .then((response) => { if (active) setModuleData(response.data?.data || []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || `Unable to load ${tab}.`); })
      .finally(() => { if (active) setModuleLoading(false); });
    return () => { active = false; };
  }, [tab, search]);

  const filteredUsers = useMemo(() => users.filter((user) => 
    (!roleFilter || user?.role === roleFilter) && 
    `${user?.name || ''} ${user?.email || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [users, roleFilter, search]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveMedicine = async (event) => {
    event.preventDefault();
    try { 
      const payload = { ...form, brandName: form.name, quantityAdded: Number(form.stock), sellingPrice: Number(form.price) }; 
      const response = editingMedicine 
        ? await api.patch(`/admin/inventory/${editingMedicine._id}`, payload) 
        : await api.post('/admin/inventory', payload); 
      const saved = response.data?.data; 
      setInventory((current) => editingMedicine ? current.map((item) => item._id === saved?._id ? saved : item) : [saved, ...current]); 
      setEditingMedicine(null); 
      setForm(emptyMedicine); 
      setTab('inventory'); 
      notify('Medicine saved.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to save medicine.'); 
    }
  };

  const deleteMedicine = async (item) => { 
    if (!window.confirm(`Delete ${item?.name || 'this medicine'}?`)) return; 
    try { 
      await api.delete(`/admin/inventory/${item._id}`); 
      setInventory((current) => current.filter((entry) => entry._id !== item._id)); 
      notify('Medicine deleted.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to delete medicine.'); 
    } 
  };

  const verifyDoctor = async (id, approved) => { 
    try { 
      await (approved ? api.put(`/admin/doctors/${id}/approve`) : api.delete(`/admin/doctors/${id}/reject`)); 
      setDoctors((current) => current.filter((doctor) => doctor._id !== id)); 
      notify(approved ? 'Doctor approved.' : 'Doctor rejected.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to update doctor.'); 
    } 
  };

  const updateRole = async (user, role) => { 
    try { 
      const response = await api.patch(`/admin/users/${user._id}/role`, { role }); 
      const updated = response.data?.data; 
      setUsers((current) => current.map((entry) => entry._id === updated?._id ? updated : entry)); 
      notify('User role updated.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to update role.'); 
    } 
  };

  const deleteUser = async (user) => { 
    if (!window.confirm(`Delete ${user?.email || 'this user'}?`)) return; 
    try { 
      await api.delete(`/admin/users/${user._id}`); 
      setUsers((current) => current.filter((entry) => entry._id !== user._id)); 
      notify('User deleted.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to delete user.'); 
    } 
  };

  const createAlert = async (event) => { 
    event.preventDefault(); 
    try { 
      const response = await api.post('/admin/outbreaks', alertForm); 
      setModuleData((current) => [response.data?.data, ...current]); 
      setAlertForm({ title: '', message: '', area: 'Campus-wide', severity: 'Info' }); 
      notify('Campus alert posted.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to post alert.'); 
    } 
  };

  const updateEmergency = async (id, status) => { 
    try { 
      const response = await api.patch(`/admin/emergencies/${id}/status`, { status }); 
      setModuleData((current) => current.map((item) => item._id === id ? response.data?.data : item)); 
      notify(`Emergency ${status.toLowerCase()}.`); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to update emergency.'); 
    } 
  };

  const updateAppointment = async (id, status) => { 
    try { 
      const response = await api.patch(`/admin/appointments/${id}`, { status }); 
      setModuleData((current) => current.map((item) => item._id === id ? { ...item, ...response.data?.data } : item)); 
      notify('Appointment status updated.'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Unable to update appointment.'); 
    } 
  };

  const cards = overview ? [
    ['Users', overview.users], 
    ['Doctors', overview.doctors], 
    ['Appointments', overview.appointments], 
    ['Medicines', overview.medicines], 
    ['Low Stock', overview.lowStock], 
    ['Expiring Soon', overview.expiringSoon]
  ] : [];

  const go = (id) => setTab(id);

  const InventoryView = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditingMedicine(null); setForm(emptyMedicine); go('add'); }} className="btn btn-primary btn-sm text-white">
          Add Medicine
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <table className="table min-w-[620px]">
          <thead>
            <tr className="dark:text-slate-300 dark:border-slate-800">
              <th>Medicine</th>
              <th>Generic</th>
              <th>Batch</th>
              <th>Stock</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="dark:text-slate-200">
            {inventory?.map((item) => (
              <tr key={item?._id} className="dark:border-slate-800">
                <td>{item?.name || 'Unnamed'}</td>
                <td>{item?.genericName || 'N/A'}</td>
                <td>{item?.batchNumber || 'N/A'}</td>
                <td>{item?.stock ?? 0}</td>
                <td>{item?.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button className="btn btn-xs btn-ghost text-primary" onClick={() => { setEditingMedicine(item); setForm({ name: item?.name || '', genericName: item?.genericName || '', category: item?.category || '', stock: item?.stock ?? 0, price: item?.price ?? 0, batchNumber: item?.batchNumber || '', expiryDate: item?.expiryDate ? String(item.expiryDate).slice(0, 10) : '', lowStockThreshold: item?.lowStockThreshold ?? 10 }); go('add'); }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="btn btn-xs btn-ghost text-error" onClick={() => deleteMedicine(item)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && <EmptyState message="No medicines in inventory." />}
      </div>
    </div>
  );

  const DoctorsView = () => (
    doctors.length === 0 ? <EmptyState message="No pending doctor verification requests." /> : (
      <div className="space-y-3">
        {doctors?.map((doctor) => (
          <div key={doctor?._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center transition-colors">
            <div>
              <p className="font-bold dark:text-slate-100">{doctor?.user?.name || 'Doctor'}</p>
              <p className="text-sm text-primary">{doctor?.specialization || 'N/A'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">BMDC: {doctor?.bmdcRegistrationNumber || 'Not provided'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => verifyDoctor(doctor._id, true)} className="btn btn-xs btn-success text-white">Approve</button>
              <button onClick={() => verifyDoctor(doctor._id, false)} className="btn btn-xs btn-error text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    )
  );

  const RecordsView = () => (
    <div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student ID, email, or name" className="input input-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 input-sm w-full mb-4" />
      {moduleData.length === 0 ? <EmptyState message="No health records found." /> : (
        moduleData?.map((record) => (
          <div key={record?.user?._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-2 transition-colors">
            <p className="font-bold dark:text-slate-100">{record?.user?.name || 'Student'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{record?.user?.email || 'N/A'} | Blood group: {record?.user?.bloodGroup || 'N/A'} | Allergies: {record?.user?.allergies || 'None'}</p>
          </div>
        ))
      )}
    </div>
  );

  const EmergencyView = () => (
    !Array.isArray(moduleData) || moduleData.length === 0 ? <EmptyState message="No emergency requests found." /> : (
      <div className="space-y-2">
        {moduleData?.map((item) => (
          <div key={item?._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap justify-between gap-3 items-center transition-colors">
            <div>
              <p className="font-bold dark:text-slate-100">{item?.patient?.name || item?.name || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item?.location || 'N/A'} | {item?.phone || item?.patient?.phone || 'N/A'}</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="badge badge-warning">{item?.status || 'Pending'}</span>
              {item?.status === 'Pending' && <button onClick={() => updateEmergency(item._id, 'Dispatched')} className="btn btn-xs btn-primary text-white">Dispatch</button>}
              {item?.status === 'Dispatched' && <button onClick={() => updateEmergency(item._id, 'Resolved')} className="btn btn-xs btn-success text-white">Resolve</button>}
            </div>
          </div>
        ))}
      </div>
    )
  );

  const QueueView = () => (
    moduleData.length === 0 ? <EmptyState message="No consultation queue records found." /> : (
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <table className="table min-w-[620px]">
          <thead>
            <tr className="dark:text-slate-300 dark:border-slate-800">
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="dark:text-slate-200">
            {moduleData?.map((item) => (
              <tr key={item?._id} className="dark:border-slate-800">
                <td>{item?.patient?.name || 'N/A'}</td>
                <td>{item?.doctor?.user?.name || 'N/A'}</td>
                <td>{item?.date || 'N/A'}</td>
                <td>
                  <select value={item?.status || 'Pending'} onChange={(event) => updateAppointment(item._id, event.target.value)} className="select select-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 select-xs">
                    {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  const ModuleView = () => { 
    if (tab === 'inventory') return <InventoryView />; 
    if (tab === 'doctors') return <DoctorsView />; 
    if (tab === 'records') return <RecordsView />; 
    if (tab === 'emergency') return <EmergencyView />; 
    if (tab === 'queue') return <QueueView />; 
    if (tab === 'outbreaks') return (
      <div className="space-y-4">
        <form onSubmit={createAlert} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid gap-3 transition-colors">
          <input required value={alertForm.title} onChange={(event) => setAlertForm({ ...alertForm, title: event.target.value })} placeholder="Alert title" className="input input-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 input-sm" />
          <input required value={alertForm.area} onChange={(event) => setAlertForm({ ...alertForm, area: event.target.value })} placeholder="Hall or department" className="input input-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 input-sm" />
          <textarea required value={alertForm.message} onChange={(event) => setAlertForm({ ...alertForm, message: event.target.value })} placeholder="Campus health alert" className="textarea textarea-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          <button className="btn btn-primary text-white">Post Health Alert</button>
        </form>
        {moduleData.length === 0 ? <EmptyState message="No active health alerts." /> : (
          moduleData?.map((alert) => (
            <div key={alert?._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
              <p className="font-bold text-primary">{alert?.title}</p>
              <p className="text-sm dark:text-slate-200">{alert?.message}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{alert?.area || 'Campus-wide'}</p>
            </div>
          ))
        )}
      </div>
    ); 
    if (tab === 'finance') return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Pharmacy Sales', moduleData?.pharmacySales], 
          ['Consultations', moduleData?.consultationSales], 
          ['Total', moduleData?.total]
        ].map(([label, value]) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-primary">৳{value ?? 0}</p>
          </div>
        ))}
      </div>
    ); 
    if (tab === 'audit') return (
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <table className="table min-w-[620px]">
          <thead>
            <tr className="dark:text-slate-300 dark:border-slate-800">
              <th>Time</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="dark:text-slate-200">
            {moduleData?.map((log) => (
              <tr key={log?._id} className="dark:border-slate-800">
                <td>{log?.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</td>
                <td>{log?.actor?.email || 'N/A'}</td>
                <td>{log?.actor?.role || 'N/A'}</td>
                <td>{log?.action || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {moduleData.length === 0 && <EmptyState message="No audit logs found." />}
      </div>
    ); 
    return <EmptyState message="No records available for this module." />; 
  };

  return (
    <div className="container mx-auto px-3 py-4 sm:p-6 max-w-7xl">
      <div className="bg-primary text-white p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold">Super Admin Console</h1>
        <p className="mt-1 opacity-90">CampusClinic operations, inventory, verification, and audit control.</p>
      </div>

      {notice && <div className="alert alert-success mb-4 text-white">{notice}</div>}
      {error && <div className="alert alert-error mb-4 text-white">{error}</div>}

      {/* FIXED TAB NAVIGATION */}
      <div className="bg-slate-200/70 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-6 overflow-x-auto overflow-y-hidden flex items-center gap-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-colors">
        <button 
          onClick={() => go('overview')} 
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
            tab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
          }`}
        >
          Overview
        </button>

        <button 
          onClick={() => go('users')} 
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
            tab === 'users' ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
          }`}
        >
          Users
        </button>

        <button 
          onClick={() => { setEditingMedicine(null); setForm(emptyMedicine); go('add'); }} 
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
            tab === 'add' ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
          }`}
        >
          Add Medicine
        </button>

        {modules.map(([id, label]) => (
          <button 
            key={id} 
            onClick={() => go(id)} 
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
              tab === id ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : tab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map(([label, value]) => (
              <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-primary mt-2">{value ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
            <h2 className="font-bold text-lg mb-4 dark:text-slate-100">Monthly Appointments & Consultations</h2>
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.map((item) => ({ ...item, appointments: Number(item?.appointments || 0), consultations: Number(item?.consultations || 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="appointments" fill="#5000ff" />
                  <Bar dataKey="consultations" fill="#00d2b5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {modules.map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary dark:hover:text-primary transition-colors">
                {label}
                <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">Open operational view</span>
              </button>
            ))}
          </div>
        </>
      ) : tab === 'users' ? (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="input input-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 input-sm flex-1" />
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="select select-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 select-sm">
              <option value="">All Roles</option>
              {['patient', 'doctor', 'rider', 'admin', 'super_admin'].map((role) => <option key={role}>{role}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <table className="table min-w-[620px]">
              <thead>
                <tr className="dark:text-slate-300 dark:border-slate-800">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="dark:text-slate-200">
                {filteredUsers?.map((user) => (
                  <tr key={user?._id} className="dark:border-slate-800">
                    <td>{user?.name || 'Unknown'}</td>
                    <td>{user?.email || 'N/A'}</td>
                    <td>
                      <select value={user?.role || 'patient'} onChange={(event) => updateRole(user, event.target.value)} className="select select-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 select-xs">
                        <option>patient</option>
                        <option>doctor</option>
                        <option>rider</option>
                        <option>admin</option>
                        <option>pharmacist</option>
                        <option>receptionist</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => deleteUser(user)} className="btn btn-xs btn-ghost text-error">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <EmptyState message="No matching users found." />}
          </div>
        </div>
      ) : tab === 'add' ? (
        <form onSubmit={saveMedicine} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors">
          {Object.entries({ 
            name: 'Brand Name', 
            genericName: 'Generic Name', 
            category: 'Category', 
            stock: 'Stock', 
            price: 'Price', 
            batchNumber: 'Batch Number', 
            expiryDate: 'Expiry Date', 
            lowStockThreshold: 'Low Stock Threshold' 
          }).map(([field, label]) => (
            <label key={field} className="form-control">
              <span className="label-text text-xs font-semibold dark:text-slate-300">{label}</span>
              <input 
                required={field === 'name' || field === 'category'} 
                type={field === 'expiryDate' ? 'date' : ['stock', 'price', 'lowStockThreshold'].includes(field) ? 'number' : 'text'} 
                name={field} 
                value={form[field]} 
                onChange={updateField} 
                className="input input-bordered dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 input-sm" 
              />
            </label>
          ))}
          <button className="btn btn-primary text-white md:col-span-2">
            {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </form>
      ) : moduleLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <ModuleView />
      )}
    </div>
  );
};

export default AdminDashboard;