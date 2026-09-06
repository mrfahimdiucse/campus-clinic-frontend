import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Video, Building2, Ticket, MapPin, ExternalLink, Calendar, Clock, FileText, X } from 'lucide-react';

// Add this near the top of PatientDashboard.jsx (outside the component)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const ITEM_LIMIT = 3;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const medicineVal = payload.find((p) => p.dataKey === 'medicine')?.value || 0;
  const consultationsVal = payload.find((p) => p.dataKey === 'consultations')?.value || 0;

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <p className="text-[#5000ff] font-semibold">
        Medicine Expenses: ৳{medicineVal}
      </p>
      <p className="text-[#00d2b5] font-semibold">
        Doctor Consultations: ৳{consultationsVal}
      </p>
    </div>
  );
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Toggle States for Items Limiting
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Prescription View State
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  // Fetch Appointments and Orders
  const fetchDashboardData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [appointmentsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointments/my-appointments`, { headers, signal }),
        axios.get(`${API_BASE_URL}/pharmacy/my-orders`, { headers, signal }),
      ]);

      setAppointments(appointmentsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setErrorMessage('Failed to load dashboard data. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrescription = async (appointmentId) => {
    setLoadingPrescription(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE_URL}/prescriptions/appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPrescription(res.data.data);
    } catch {
      setErrorMessage('Could not load prescription for this appointment.');
    } finally {
      setLoadingPrescription(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  // Keyboard shortcut listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedPrescription) {
        setSelectedPrescription(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPrescription]);

  // Real Dynamic 6 Months Expense Calculation
  const expenseData = useMemo(() => {
    const result = [];
    const now = new Date();

    const parseValidDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();

      const medicineTotal = orders.reduce((sum, order) => {
        const orderDate = parseValidDate(order.createdAt || order.date);
        if (orderDate && orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear) {
          return sum + (Number(order.totalAmount) || 0);
        }
        return sum;
      }, 0);

      const consultationTotal = appointments.reduce((sum, appt) => {
        const apptDate = parseValidDate(appt.date);
        if (apptDate && apptDate.getMonth() === targetMonth && apptDate.getFullYear() === targetYear) {
          return sum + (Number(appt.fee || appt.doctor?.consultationFee) || 0);
        }
        return sum;
      }, 0);

      result.push({
        month: monthLabel,
        medicine: medicineTotal,
        consultations: consultationTotal,
      });
    }

    return result;
  }, [orders, appointments]);

  const visibleAppointments = showAllAppointments ? appointments : appointments.slice(0, ITEM_LIMIT);
  const visibleOrders = showAllOrders ? orders : orders.slice(0, ITEM_LIMIT);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Alert Error Notification */}
      {errorMessage && (
        <div className="alert alert-error mb-4 shadow-sm flex justify-between text-xs text-white">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold">Dismiss</button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-base-200 p-6 rounded-2xl mb-8 shadow-sm">
        <h1 className="text-3xl font-bold text-primary">Welcome, {user?.name || 'Patient'}!</h1>
        <p className="text-gray-600 mt-1">
          Manage your appointment history, join video calls, and track medicine orders.
        </p>
      </div>

      {/* Analytics Component */}
      <div className="bg-[#F8FAFC] p-6 rounded-2xl mb-8 shadow-sm border border-slate-200">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Health & Expense Tracker</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              6-Month Spending Breakdown: Medicine vs Doctor Consultations
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-[#5000ff] inline-block"></span>
              Medicine
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-[#00d2b5] inline-block"></span>
              Consultations
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expenseData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(val) => `৳${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="medicine"
                name="Medicine Expenses"
                stroke="#5000ff"
                strokeWidth={3}
                dot={{ r: 4, fill: '#5000ff' }}
                activeDot={{ r: 7, fill: '#5000ff', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="consultations"
                name="Doctor Consultations"
                stroke="#00d2b5"
                strokeWidth={3}
                dot={{ r: 4, fill: '#00d2b5' }}
                activeDot={{ r: 7, fill: '#00d2b5', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Appointments Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                My Appointments <span className="badge badge-primary">{appointments.length}</span>
              </h2>

              {appointments.length > ITEM_LIMIT && (
                <button
                  onClick={() => setShowAllAppointments(!showAllAppointments)}
                  className="text-sm font-bold text-primary hover:text-primary-focus transition-colors flex items-center gap-1"
                >
                  {showAllAppointments ? 'Show Less' : `View All (${appointments.length})`}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${showAllAppointments ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-8 bg-base-100 rounded-2xl border border-dashed border-base-300">
                <p className="text-gray-500 text-lg">You have no booked appointments yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-base-100 shadow-md rounded-2xl border border-base-200 transition-all duration-300">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200 text-base">
                      <th>Doctor</th>
                      <th>Mode</th>
                      <th>Date & Time</th>
                      <th>Location / Meeting Link</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAppointments.map((item) => {
                      const isOnline = item.mode === 'Online' || item.appointmentType === 'online' || item.consultationMode === 'online' || !!item.meetingLink;
                      const isConfirmed = String(item.status || '').toLowerCase() === 'confirmed' || item.isApproved === true;
                      const callUrl = isOnline && isConfirmed && item.meetingLink ? item.meetingLink : null;
                      const statusStr = (item.status || 'Confirmed').toLowerCase();

                      return (
                        <tr key={item._id} className="hover">
                          <td>
                            <div className="font-bold text-slate-800">
                              {item.doctorName || item.doctor?.user?.name || item.doctor?.name || 'Dr. Medical Expert'}
                            </div>
                            <div className="text-xs text-primary font-medium">
                              {item.specialization || item.doctor?.specialization || 'General Physician'}
                            </div>
                          </td>

                          <td>
                            {isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#5000ff]/10 text-[#5000ff]">
                                <Video className="w-3.5 h-3.5" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                                <Building2 className="w-3.5 h-3.5" />
                                Chamber
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="font-medium flex items-center gap-1 text-slate-800 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {item.date}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.timeSlot || item.slotTime || 'N/A'}
                            </div>
                          </td>

                          <td className="max-w-xs">
                            {isOnline ? (
                              callUrl ? (
                                <a
                                  href={callUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono text-[#5000ff] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                >
                                  <span>{callUrl}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400">Link pending approval</span>
                              )
                            ) : (
                              <div className="space-y-0.5">
                                {item.tokenNumber && (
                                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5000ff] bg-[#5000ff]/5 px-2 py-0.5 rounded border border-[#5000ff]/20">
                                    <Ticket className="w-3 h-3" />
                                    Token: {item.tokenNumber}
                                  </span>
                                )}
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {item.chamberLocation || item.doctor?.chamberLocation || 'Campus Center'}
                                </p>
                              </div>
                            )}
                          </td>

                          <td>
                            <span
                              className={`badge badge-sm font-semibold p-2 ${
                                statusStr === 'completed'
                                  ? 'badge-success text-white'
                                  : statusStr === 'confirmed'
                                  ? 'badge-info text-white'
                                  : statusStr === 'cancelled'
                                  ? 'badge-error text-white'
                                  : 'badge-warning text-slate-800'
                              }`}
                            >
                              {item.status || 'Confirmed'}
                            </span>
                          </td>

                          <td>
                            <div className="flex items-center gap-2">
                              {isOnline && callUrl && statusStr !== 'cancelled' && (
                                <a
                                  href={callUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-xs bg-[#5000ff] hover:bg-[#4000d6] text-white border-none font-bold gap-1 shadow-sm"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Join Video Call</span>
                                </a>
                              )}

                              {isOnline && !callUrl && statusStr !== 'cancelled' && (
                                <span className="text-xs text-slate-400 italic">Awaiting Doctor Approval</span>
                              )}

                              {(statusStr === 'completed' || item.hasPrescription) && (
                                <button
                                  disabled={loadingPrescription}
                                  onClick={() => fetchPrescription(item._id)}
                                  className="btn btn-xs btn-outline btn-primary flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Rx</span>
                                </button>
                              )}

                              {!isOnline && statusStr !== 'completed' && (
                                <span className="text-xs text-slate-400 italic">In-Person</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Medicine Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                My Medicine Orders <span className="badge badge-secondary">{orders.length}</span>
              </h2>

              {orders.length > ITEM_LIMIT && (
                <button
                  onClick={() => setShowAllOrders(!showAllOrders)}
                  className="text-sm font-bold text-primary hover:text-primary-focus transition-colors flex items-center gap-1"
                >
                  {showAllOrders ? 'Show Less' : `View All (${orders.length})`}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${showAllOrders ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 bg-base-100 rounded-2xl border border-dashed border-base-300">
                <p className="text-gray-500 text-lg">No medicine orders placed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
                {visibleOrders.map((order) => {
                  const orderStatus = (order.status || 'Pending').toLowerCase();
                  return (
                    <div key={order._id} className="card bg-base-100 shadow-md border border-base-200">
                      <div className="card-body p-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono text-gray-400">ID: #{order._id?.slice(-6)}</span>
                          <span
                            className={`badge font-semibold text-xs ${
                              orderStatus === 'delivered'
                                ? 'badge-success text-white'
                                : orderStatus === 'on the way' || orderStatus === 'shipped'
                                ? 'badge-info text-white'
                                : orderStatus === 'picked up'
                                ? 'badge-accent text-white'
                                : 'badge-warning text-slate-800'
                            }`}
                          >
                            {order.status || 'Processing'}
                          </span>
                        </div>

                        <div className="space-y-1 mb-3 bg-base-200 p-3 rounded-lg">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">
                                {item.name || item.medicineName} × {item.quantity}
                              </span>
                              <span className="font-semibold">৳{(item.price || 0) * (item.quantity || 1)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                          <p><strong>Address:</strong> {order.shippingAddress || 'N/A'}</p>
                          <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                        </div>

                        <div className="divider my-2"></div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs text-gray-400 block">Payment</span>
                            <span className="text-xs font-bold">{order.paymentMethod || 'COD'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 block">Total Amount</span>
                            <span className="text-lg font-bold text-primary">৳{order.totalAmount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedPrescription && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-2xl border border-base-300 shadow-xl relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  ⚡ CampusClinic
                </h2>
                <p className="text-xs text-gray-500">Official Medical Prescription</p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="btn btn-sm btn-circle btn-ghost"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 text-xs text-slate-600 space-y-1">
              <p><strong>Doctor:</strong> {selectedPrescription.doctor?.name || selectedPrescription.doctorName || 'Dr. Specialist'}</p>
              <p><strong>Patient:</strong> {selectedPrescription.patient?.name || user?.name || 'Patient'}</p>
              <p><strong>Date:</strong> {selectedPrescription.createdAt ? new Date(selectedPrescription.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p className="mt-2">
                <strong>Diagnosis:</strong>{' '}
                <span className="badge badge-outline badge-primary font-semibold text-xs">
                  {selectedPrescription.diagnosis || 'General Checkup'}
                </span>
              </p>
            </div>

            <div className="my-4">
              <h4 className="font-bold text-sm mb-2 text-secondary uppercase tracking-wider">Rx (Medicines)</h4>
              <div className="overflow-x-auto">
                <table className="table table-compact w-full border border-base-200 text-xs">
                  <thead>
                    <tr className="bg-base-200 text-slate-700">
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines?.map((med, index) => (
                      <tr key={index} className="hover">
                        <td className="font-semibold text-slate-800">{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.duration}</td>
                        <td>{med.instructions || 'As advised'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedPrescription.instructions && (
              <div className="p-3 bg-base-200 rounded-lg text-xs mt-3">
                <strong>Advice / Notes:</strong>
                <p className="mt-1 text-slate-600">{selectedPrescription.instructions}</p>
              </div>
            )}

            <div className="modal-action">
              <button onClick={() => setSelectedPrescription(null)} className="btn btn-sm btn-primary text-white">
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/40" onClick={() => setSelectedPrescription(null)}></div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;