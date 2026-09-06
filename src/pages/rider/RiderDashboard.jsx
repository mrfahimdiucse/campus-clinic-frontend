// RiderDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://campus-clinic-backend-jmil.onrender.com/api/v1';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-base-100 p-3 rounded-xl shadow-lg border border-base-200 text-xs space-y-1">
        <p className="font-bold text-gray-700">{label}</p>
        <p className="text-[#5000ff] font-semibold">Total Earnings: ৳{data.earnings || 0}</p>
        <p className="text-[#00d2b5] font-semibold">Orders Completed: {data.orders || 0}</p>
      </div>
    );
  }
  return null;
};

const RiderDashboard = () => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [stats, setStats] = useState({ totalDeliveries: 0, activeDeliveries: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionId, setActionId] = useState(null); // Tracks pending order updates

  // Analytics State
  const [timeframe, setTimeframe] = useState('Week');
  const [analyticsData, setAnalyticsData] = useState([]);

  // Toggle State for My Assigned Deliveries
  const [showAllDeliveries, setShowAllDeliveries] = useState(false);
  const DELIVERY_LIMIT = 2;

  // Use Ref to keep timeframe fresh inside interval closures
  const timeframeRef = useRef(timeframe);
  timeframeRef.current = timeframe;

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const generateChartDataFromDeliveries = (deliveries, currentFilter) => {
    const completed = deliveries.filter((d) => d.status === 'Delivered');
    if (completed.length === 0) return [];

    const grouped = {};

    // Sort chronologically before grouping
    const sorted = [...completed].sort(
      (a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
    );

    sorted.forEach((item) => {
      const dateObj = new Date(item.updatedAt || item.createdAt || Date.now());
      let key = '';

      if (currentFilter === 'Day') {
        key = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '00' });
      } else if (currentFilter === 'Week') {
        key = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        key = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!grouped[key]) {
        grouped[key] = { date: key, earnings: 0, orders: 0 };
      }

      const riderEarning = Number(item.deliveryFee || item.riderEarning || 40);
      grouped[key].earnings += riderEarning;
      grouped[key].orders += 1;
    });

    return Object.values(grouped);
  };

  const fetchAnalytics = async (selectedTimeframe, currentDeliveries, signal) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/rider/analytics?timeframe=${selectedTimeframe.toLowerCase()}`,
        { headers: getHeaders(), signal }
      );
      if (res.data?.data && res.data.data.length > 0) {
        setAnalyticsData(res.data.data);
        return;
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      // Fallback to local delivery array aggregation if API endpoint is unhandled
    }

    const calculatedData = generateChartDataFromDeliveries(currentDeliveries, selectedTimeframe);
    setAnalyticsData(calculatedData);
  };

  const fetchRiderData = useCallback(async (signal) => {
    try {
      setErrorMessage('');
      const headers = getHeaders();
      const [availRes, delivRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/rider/available-orders`, { headers, signal }),
        axios.get(`${API_BASE_URL}/rider/my-deliveries`, { headers, signal }),
        axios.get(`${API_BASE_URL}/rider/stats`, { headers, signal }),
      ]);

      const deliveries = Array.isArray(delivRes.data?.data) ? delivRes.data.data : [];
      setAvailableOrders(Array.isArray(availRes.data?.data) ? availRes.data.data : []);
      setMyDeliveries(deliveries);
      setStats(statsRes.data?.data || { totalDeliveries: 0, activeDeliveries: 0, totalEarnings: 0 });

      fetchAnalytics(timeframeRef.current, deliveries, signal);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setErrorMessage(err.response?.data?.message || 'Unable to load rider data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchRiderData(controller.signal);

    const interval = setInterval(() => {
      fetchRiderData(controller.signal);
    }, 10000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchRiderData]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe, myDeliveries);
  };

  const handleAcceptOrder = async (orderId) => {
    setActionId(orderId);
    try {
      await axios.patch(
        `${API_BASE_URL}/rider/orders/${orderId}/accept`,
        {},
        { headers: getHeaders() }
      );
      alert('Order claimed successfully! Check your active deliveries.');
      fetchRiderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Order already taken by another rider!');
      fetchRiderData();
    } finally {
      setActionId(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setActionId(orderId);
    try {
      await axios.patch(
        `${API_BASE_URL}/rider/orders/${orderId}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );
      alert(`Status updated to: ${newStatus}`);
      fetchRiderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const visibleDeliveries = showAllDeliveries ? myDeliveries : myDeliveries.slice(0, DELIVERY_LIMIT);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="bg-base-200 p-6 rounded-2xl mb-8 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">🚴 Rider Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-bold">{user?.name || 'Rider'}</span>! Accept campus delivery requests.
          </p>
        </div>
      </div>

      {/* Personal Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-primary text-primary-content rounded-2xl shadow">
          <div className="stat-title text-white/80">My Completed Deliveries</div>
          <div className="stat-value">{stats.totalDeliveries}</div>
        </div>
        <div className="stat bg-secondary text-secondary-content rounded-2xl shadow">
          <div className="stat-title text-white/80">My Active Deliveries</div>
          <div className="stat-value">{stats.activeDeliveries}</div>
        </div>
        <div className="stat bg-accent text-accent-content rounded-2xl shadow">
          <div className="stat-title text-white/80">My Total Earnings</div>
          <div className="stat-value">৳{stats.totalEarnings}</div>
        </div>
      </div>

      {/* Analytics Graph Section */}
      <div className="bg-base-100 p-6 rounded-2xl shadow-md border border-base-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Earnings & Delivery Trends</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your overall delivery performance and payout history</p>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex bg-base-200 p-1 rounded-xl gap-1">
            {['Day', 'Week', 'Month'].map((option) => (
              <button
                key={option}
                onClick={() => handleTimeframeChange(option)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  timeframe === option
                    ? 'bg-[#5000ff] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-base-300/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Smooth Area Chart */}
        <div className="w-full h-72">
          {analyticsData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-base-200/40 rounded-xl border border-dashed border-base-300 text-gray-400 text-sm">
              No completed delivery data available for chart analysis yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="primaryColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5000ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5000ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#888888', fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 12 }}
                  tickFormatter={(value) => `৳${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#5000ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#primaryColorGrad)"
                  activeDot={{ r: 6, fill: '#00d2b5', stroke: '#5000ff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {errorMessage && <div className="alert alert-error mb-4 text-white">{errorMessage}</div>}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Section 1: All Available Orders */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📦 Available Orders <span className="badge badge-primary">{availableOrders.length}</span>
            </h2>

            {availableOrders.length === 0 ? (
              <div className="p-8 bg-base-100 rounded-2xl border border-dashed text-center text-gray-500">
                No open delivery requests currently available.
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order._id} className="card bg-base-100 shadow-md border border-base-200">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-base">{order.patient?.name || 'Patient'}</span>
                        <span className="badge badge-warning text-xs">Pending Rider</span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Delivery Location:</strong> {order.shippingAddress}</p>
                        <p><strong>Contact Phone:</strong> {order.phone}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod} (৳{order.totalAmount})</p>
                      </div>

                      <div className="divider my-2"></div>

                      <button
                        disabled={actionId === order._id}
                        onClick={() => handleAcceptOrder(order._id)}
                        className="btn btn-primary btn-sm text-white w-full"
                      >
                        {actionId === order._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          'Accept & Deliver'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Personal Active & Past Deliveries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🚚 My Assigned Deliveries <span className="badge badge-secondary">{myDeliveries.length}</span>
              </h2>

              {myDeliveries.length > DELIVERY_LIMIT && (
                <button
                  onClick={() => setShowAllDeliveries(!showAllDeliveries)}
                  className="text-sm font-bold text-primary hover:text-primary-focus transition-colors flex items-center gap-1"
                >
                  {showAllDeliveries ? 'Show Less' : `View All (${myDeliveries.length})`}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${showAllDeliveries ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {myDeliveries.length === 0 ? (
              <div className="p-8 bg-base-100 rounded-2xl border border-dashed text-center text-gray-500">
                You have not accepted any orders yet.
              </div>
            ) : (
              <div className="space-y-4 transition-all duration-300">
                {visibleDeliveries.map((deliv) => (
                  <div key={deliv._id} className="card bg-base-100 shadow-md border border-base-200">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-base">{deliv.patient?.name || 'Patient'}</span>
                        <span
                          className={`badge text-xs font-semibold ${
                            deliv.status === 'Delivered'
                              ? 'badge-success text-white'
                              : deliv.status === 'On the Way'
                              ? 'badge-info text-white'
                              : 'badge-accent text-white'
                          }`}
                        >
                          {deliv.status}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Address:</strong> {deliv.shippingAddress}</p>
                        <p><strong>Phone:</strong> {deliv.phone}</p>
                        <p>
                          <strong>Payment Status:</strong>{' '}
                          <span className={deliv.paymentStatus === 'Paid' ? 'text-success font-bold' : 'text-error font-bold'}>
                            {deliv.paymentStatus} (৳{deliv.totalAmount})
                          </span>
                        </p>
                      </div>

                      {deliv.status !== 'Delivered' && (
                        <div className="mt-4 pt-3 border-t flex gap-2">
                          {deliv.status === 'Accepted' && (
                            <button
                              disabled={actionId === deliv._id}
                              onClick={() => handleStatusUpdate(deliv._id, 'Picked Up')}
                              className="btn btn-warning btn-xs text-white flex-1"
                            >
                              {actionId === deliv._id ? 'Updating...' : 'Mark Picked Up'}
                            </button>
                          )}
                          {deliv.status === 'Picked Up' && (
                            <button
                              disabled={actionId === deliv._id}
                              onClick={() => handleStatusUpdate(deliv._id, 'On the Way')}
                              className="btn btn-info btn-xs text-white flex-1"
                            >
                              {actionId === deliv._id ? 'Updating...' : 'Mark On the Way'}
                            </button>
                          )}
                          {deliv.status === 'On the Way' && (
                            <button
                              disabled={actionId === deliv._id}
                              onClick={() => handleStatusUpdate(deliv._id, 'Delivered')}
                              className="btn btn-success btn-xs text-white flex-1"
                            >
                              {actionId === deliv._id ? 'Updating...' : 'Mark Delivered & Collect Cash'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;