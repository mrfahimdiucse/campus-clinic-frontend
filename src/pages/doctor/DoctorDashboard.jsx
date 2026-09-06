import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const createEmptyMedicine = () => ({
  id: `${Date.now()}-${Math.random()}`,
  name: '',
  dosage: '1-0-1',
  duration: '7 days',
  instructions: 'After food',
});

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toggle State for Item Limiting
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const ITEM_LIMIT = 3;

  // Prescription Form State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [medicines, setMedicines] = useState([createEmptyMedicine()]);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Helper for Headers
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Fetch Doctor Appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/appointments/doctor-appointments`,
        getAuthHeaders()
      );
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Real-Time Dynamic KPI Metrics
  const kpiData = useMemo(() => {
    const completed = appointments.filter((a) => a.status === 'Completed').length;
    const active = appointments.filter(
      (a) => a.status === 'Confirmed' || a.status === 'Pending'
    ).length;

    return {
      completed,
      active,
      total: appointments.length,
    };
  }, [appointments]);

  // 1. Dynamic Weekly Attendance Calculation (Timezone-Safe)
  const weeklyData = useMemo(() => {
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    appointments.forEach((appt) => {
      if (!appt.date) return;

      // Extract year, month, day to prevent UTC-to-Local timezone shifts
      const dateParts = appt.date.split('T')[0].split('-');
      if (dateParts.length !== 3) return;

      const [year, month, day] = dateParts.map(Number);
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) return;

      const dayName = dayMap[d.getDay()];
      if (counts[dayName] !== undefined) {
        counts[dayName] += 1;
      }
    });

    return daysOrder.map((day) => ({
      day,
      count: counts[day],
    }));
  }, [appointments]);

  // 2. Dynamic Diagnosis / Problem Breakdown Calculation
  const problemData = useMemo(() => {
    if (!appointments.length) return [];

    const counts = {};
    let total = 0;

    appointments.forEach((appt) => {
      let problem = appt.problemDescription || appt.reason || 'General';
      problem = problem.trim();
      problem = problem.charAt(0).toUpperCase() + problem.slice(1);

      counts[problem] = (counts[problem] || 0) + 1;
      total += 1;
    });

    const colors = ['#5000ff', '#00d2b5', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sorted.length > 4) {
      const top3 = sorted.slice(0, 3);
      const others = sorted.slice(3);
      const othersCount = others.reduce((sum, item) => sum + item[1], 0);

      const result = top3.map(([name, count], idx) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[idx % colors.length],
      }));

      result.push({
        name: 'Others',
        value: Math.round((othersCount / total) * 100),
        color: '#94a3b8',
      });

      return result;
    }

    return sorted.map(([name, count], idx) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[idx % colors.length],
    }));
  }, [appointments]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/appointments/${id}`,
        { status },
        getAuthHeaders()
      );
      fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleConfirmAppointment = async (appointment) => {
    const appointmentId = appointment?._id;
    if (!appointmentId) return;

    setActionId(appointmentId);
    try {
      const meetingLink =
        appointment.mode === 'Online' || appointment.consultationMode === 'online' || appointment.appointmentType === 'online'
          ? `https://meet.jit.si/CampusClinic-Consult-${appointmentId}`
          : null;
      const payload = {
        status: 'Confirmed',
        isApproved: true,
        ...(meetingLink ? { meetingLink } : {}),
      };
      const res = await axios.patch(
        `${API_BASE_URL}/appointments/${appointmentId}`,
        payload,
        getAuthHeaders()
      );
      const updatedAppointment = res.data?.data || res.data;
      setAppointments((current) =>
        current.map((item) =>
          item._id === appointmentId ? { ...item, ...updatedAppointment, ...payload } : item
        )
      );
    } catch (err) {
      console.error('Error confirming appointment:', err);
      alert(err.response?.data?.message || 'Failed to confirm appointment.');
    } finally {
      setActionId(null);
    }
  };

  // Medicine Dynamic Add/Remove (Immutable Updates)
  const handleAddMedicine = () => {
    setMedicines((prev) => [...prev, createEmptyMedicine()]);
  };

  const handleRemoveMedicine = (id) => {
    setMedicines((prev) => prev.filter((med) => med.id !== id));
  };

  const handleMedicineChange = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  // Submit Prescription
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Remove temporary runtime 'id' property before sending payload
      const cleanedMedicines = medicines.map(({ id: _id, ...rest }) => rest);

      await axios.post(
        `${API_BASE_URL}/prescriptions`,
        {
          appointmentId: selectedAppointment._id,
          patientId: selectedAppointment.patient?._id,
          patientEmail: selectedAppointment.patient?.email,
          diagnosis,
          medicines: cleanedMedicines,
          instructions: advice,
        },
        getAuthHeaders()
      );

      alert('Prescription created and sent to patient via email!');
      setSelectedAppointment(null);
      setDiagnosis('');
      setAdvice('');
      setMedicines([createEmptyMedicine()]);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleAppointments = showAllAppointments
    ? appointments
    : appointments.slice(0, ITEM_LIMIT);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="bg-primary text-primary-content p-6 rounded-2xl mb-8 shadow-sm">
        <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Doctor'}!</h1>
        <p className="mt-1 opacity-90">Manage patient appointments and consultation requests.</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <span className="text-sm font-semibold text-slate-500">Completed Consultations</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ↑ 12% this week
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpiData.completed}
            </span>
          </div>
        </div>

        <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Active Patients</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active
              </span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ↑ 8% this week
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpiData.active}
            </span>
          </div>
        </div>

        <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <span className="text-sm font-semibold text-slate-500">Total Bookings</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              ↓ 3% this week
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpiData.total}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Analytics Section */}
      <div className="bg-[#F8FAFC] p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Patient Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time patient turnouts and diagnostic distribution breakdown
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Daily Patient Attendance Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-700 mb-4">
              Daily Patient Attendance
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-md">
                            <p className="font-bold">{label}</p>
                            <p className="text-[#00d2b5] font-semibold">{payload[0].value} Patients</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#5000ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Diagnosis Breakdown Donut Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-700 mb-4">
              Patient Diagnosis Breakdown
            </h3>
            {problemData.length === 0 ? (
              <div className="w-full h-64 flex items-center justify-center text-slate-400 text-sm">
                No patient data available
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={problemData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {problemData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-md">
                                <p className="font-bold">{payload[0].name}</p>
                                <p className="font-semibold text-emerald-400">{payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full sm:w-1/2 space-y-3">
                  {problemData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600 font-medium truncate max-w-[120px]">
                        <span
                          className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-bold text-slate-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointments List Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Patient Appointments <span className="badge badge-primary">{appointments.length}</span>
        </h2>

        {appointments.length > ITEM_LIMIT && (
          <button
            onClick={() => setShowAllAppointments(!showAllAppointments)}
            className="text-sm font-bold text-primary hover:text-primary-focus transition-colors flex items-center gap-1"
          >
            {showAllAppointments ? 'Show Less' : `View All (${appointments.length})`}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                showAllAppointments ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-2xl border border-dashed border-base-300">
          <p className="text-gray-500 text-lg">No appointments booked for you yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow-md rounded-2xl border border-base-200 transition-all duration-300">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200 text-base">
                <th>Patient Name</th>
                <th>Contact Email</th>
                <th>Date & Time</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleAppointments.map((item) => (
                <tr key={item._id} className="hover">
                  <td className="font-semibold">{item.patient?.name || 'N/A'}</td>
                  <td>{item.patient?.email || 'N/A'}</td>
                  <td>
                    <div className="font-medium">{item.date}</div>
                    <div className="text-xs text-gray-500">{item.timeSlot || item.slotTime}</div>
                  </td>
                  <td className="max-w-xs truncate">{item.problemDescription || item.reason}</td>
                  <td>
                    <span
                      className={`badge badge-sm font-semibold p-2 ${
                        item.status === 'Completed'
                          ? 'badge-info text-white'
                          : item.status === 'Confirmed'
                          ? 'badge-success text-white'
                          : item.status === 'Cancelled'
                          ? 'badge-error text-white'
                          : 'badge-warning'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {item.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmAppointment(item)}
                            disabled={actionId === item._id}
                            className="btn btn-xs btn-success text-white"
                          >
                            {actionId === item._id ? 'Confirming...' : 'Confirm Appointment'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(item._id, 'Cancelled')}
                            className="btn btn-xs btn-error text-white"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {item.status === 'Confirmed' && (
                        <>
                          {(item.mode === 'Online' || item.consultationMode === 'online' || item.appointmentType === 'online') && item.meetingLink && (
                            <a
                              href={item.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs bg-[#00d2b5] hover:bg-[#00b89f] text-white border-none"
                            >
                              Join Video Call
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(item)}
                            className="btn btn-xs btn-primary text-white"
                          >
                            Write Prescription
                          </button>
                        </>
                      )}

                      {item.status === 'Completed' && (
                        <span className="text-xs text-green-600 font-semibold">Prescribed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedAppointment && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-xl text-primary mb-2">Write Prescription</h3>
            <p className="text-sm text-gray-500 mb-4">
              Patient: <strong>{selectedAppointment.patient?.name}</strong> | Problem:{' '}
              {selectedAppointment.problemDescription || selectedAppointment.reason}
            </p>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              <div>
                <label className="label font-medium">Diagnosis / Clinical Notes</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Viral Fever / Acute Gastritis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label font-medium p-0">Medicines</label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="btn btn-xs btn-outline btn-primary"
                  >
                    + Add Medicine
                  </button>
                </div>

                {medicines.map((med) => (
                  <div key={med.id} className="flex gap-2 mb-2 items-center bg-base-200 p-2 rounded-lg">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      required
                      value={med.name}
                      onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                      className="input input-sm input-bordered flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (1-0-1)"
                      required
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                      className="input input-sm input-bordered w-28"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      required
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                      className="input input-sm input-bordered w-24"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(med.id, 'instructions', e.target.value)}
                      className="input input-sm input-bordered w-32"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="btn btn-xs btn-error text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="label font-medium">Advice / Instructions</label>
                <textarea
                  placeholder="e.g. Drink plenty of water, rest for 3 days."
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="textarea textarea-bordered w-full h-20"
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-white"
                >
                  {submitting ? 'Saving...' : 'Save & Send Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;