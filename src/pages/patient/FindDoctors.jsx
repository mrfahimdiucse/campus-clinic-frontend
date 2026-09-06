import { useState, useEffect } from 'react';
import axios from 'axios';
import EmptyState from '../../components/common/EmptyState';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Modal & Booking States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointmentType, setAppointmentType] = useState('offline'); // 'offline' | 'online'
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [bookingStatus, setBookingStatus] = useState({ loading: false, message: '', error: '' });
  const [loadError, setLoadError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://campus-clinic-backend-jmil.onrender.com/api/v1';

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://campus-clinic-backend-jmil.onrender.com/api/v1';
          const res = await axios.get(`${API_BASE_URL}/doctors`, {
            params: { search, specialization, status: 'APPROVED' },
      });
      setDoctors(res.data.data || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Unable to load registered doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization]);

  const handleOpenModal = (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentType('offline');
    setTimeSlot('');
    setBookingDate('');
    setProblemDescription('');
    setBookingStatus({ loading: false, message: '', error: '' });
  };

  // সময় থেকে মিনিটে রূপান্তর (e.g. "05:00 PM" -> 1020)
  const parseTimeString = (timeStr) => {
    if (!timeStr) return null;
    const cleanStr = String(timeStr).trim().toUpperCase();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const modifier = match[3];

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  // মিনিট থেকে ১২ ঘণ্টার ফরম্যাটে রূপান্তর
  const formatMinutesTo12Hour = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${formattedMins} ${modifier}`;
  };

  // ডাইনামিক স্লট জেনারেশন
  const generateDynamicSlots = (startTimeStr, endTimeStr, durationVal) => {
    const startMins = parseTimeString(startTimeStr);
    const endMins = parseTimeString(endTimeStr);
    let duration = parseInt(String(durationVal || '').replace(/\D/g, ''), 10);
    if (isNaN(duration) || duration <= 0) duration = 15;

    if (startMins === null || endMins === null || startMins >= endMins) return [];

    const slots = [];
    let current = startMins;
    while (current + duration <= endMins) {
      const slotStart = formatMinutesTo12Hour(current);
      const slotEnd = formatMinutesTo12Hour(current + duration);
      slots.push(`${slotStart} - ${slotEnd}`);
      current += duration;
    }
    return slots;
  };

  // অনলাইন ও অফলাইনের আলাদা শিডিউল পার্সিং
  const getSlotDetails = () => {
    if (!selectedDoctor) return { slots: [], isOffDay: false, visitingDays: [], dateNotSelected: true, location: '' };

    const isOnline = appointmentType === 'online';

    // ১. অনলাইন ও অফলাইনের জন্য আলাদা অবজেক্ট চেক
    const sched = isOnline
      ? (selectedDoctor.onlineSchedule || selectedDoctor.telemedicineSchedule || selectedDoctor.schedule?.online || selectedDoctor.schedule?.telemedicine || {})
      : (selectedDoctor.chamberSchedule || selectedDoctor.schedule?.chamber || selectedDoctor.schedule || {});

    // ২. লোকেশন
    const location = isOnline
      ? 'Telemedicine Video Call (Auto-Generated Link)'
      : (sched?.location || selectedDoctor?.chamberLocation || sched?.chamberLocation || selectedDoctor?.roomNumber || 'Campus Medical Center - Room 204');

    // ৩. ভিজিটিং ডেস
      let rawDays = sched?.visitingDays || sched?.days || [];

    if (typeof rawDays === 'string') rawDays = rawDays.split(',').map(d => d.trim());
      const visitingDays = Array.isArray(rawDays) ? rawDays : [];

    if (!bookingDate) {
      return { slots: [], isOffDay: false, visitingDays, dateNotSelected: true, location };
    }

    // ৪. সিলেক্ট করা দিনের সাথে ম্যাচিং
    const selectedDateObj = new Date(bookingDate + 'T00:00:00');
    const dayNameShort = selectedDateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNameFull = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const isAvailableDay = visitingDays.some((day) => {
      if (!day) return false;
      const d = String(day).trim().toLowerCase();
      return (
        d.includes(dayNameShort.toLowerCase()) || 
        d.includes(dayNameFull.toLowerCase()) ||
        dayNameShort.toLowerCase().includes(d)
      );
    });

    if (!isAvailableDay) {
      return { slots: [], isOffDay: true, selectedDay: dayNameFull, visitingDays, location };
    }

    // ৫. অনলাইন vs অফলাইনের আলাদা স্লট জেনারেট
    let rawSlots = sched?.slots || sched?.generatedSlots || sched?.availableSlots;
    if (!Array.isArray(rawSlots) || rawSlots.length === 0) {
      rawSlots = isOnline
        ? (selectedDoctor?.onlineSlots || selectedDoctor?.telemedicineSlots)
        : (selectedDoctor?.chamberSlots || selectedDoctor?.offlineSlots || selectedDoctor?.slots);
    }

    let formattedSlots = [];

    if (Array.isArray(rawSlots) && rawSlots.length > 0) {
      formattedSlots = rawSlots.map((s) => (typeof s === 'object' ? `${s.startTime || ''} - ${s.endTime || ''}` : String(s)));
    } else {
        const startTime = sched?.startTime;
        const endTime = sched?.endTime;
        const duration = sched?.slotDuration || sched?.duration;
        formattedSlots = startTime && endTime && duration
          ? generateDynamicSlots(startTime, endTime, duration)
          : [];
    }

    return { slots: formattedSlots, isOffDay: false, visitingDays, location };
  };

  const { slots: availableSlots, isOffDay, selectedDay, visitingDays, dateNotSelected, location: activeLocation } = getSlotDetails();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      setBookingStatus({ loading: false, message: '', error: 'Please select an appointment date.' });
      return;
    }
    if (!timeSlot) {
      setBookingStatus({ loading: false, message: '', error: 'Please select an available time slot.' });
      return;
    }

    setBookingStatus({ loading: true, message: '', error: '' });

    const token = localStorage.getItem('token');
    if (!token) {
      setBookingStatus({ loading: false, message: '', error: 'Please login first to book an appointment.' });
      return;
    }

    const targetDoctorId = selectedDoctor.user?._id || selectedDoctor.user || selectedDoctor._id;

    try {
      await axios.post(
        `${API_BASE_URL}/appointments`,
        {
          doctorId: targetDoctorId,
          date: bookingDate,
          timeSlot: timeSlot,
          mode: appointmentType === 'online' ? 'Online' : 'In-Person',
          problemDescription: problemDescription,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBookingStatus({ loading: false, message: 'Appointment booked successfully!', error: '' });
      setTimeout(() => {
        setSelectedDoctor(null);
        setBookingDate('');
        setProblemDescription('');
        setTimeSlot('');
        setBookingStatus({ loading: false, message: '', error: '' });
      }, 1500);
    } catch (err) {
      setBookingStatus({
        loading: false,
        message: '',
        error: err.response?.data?.message || 'Failed to book appointment'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Find & Book Specialist Doctors</h1>
      {loadError && <div className="alert alert-error mb-4 text-white">{loadError}</div>}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by doctor name or condition..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="select select-bordered w-full"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="">All Specializations</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Pediatrics">Pediatrics</option>
        </select>

        <button onClick={fetchDoctors} className="btn btn-primary">
          Search
        </button>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState message="No registered doctors available" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const chamberLoc = doctor.chamberSchedule?.location || doctor.chamberLocation || doctor.roomNumber || 'Campus Medical Center - Room 204';
            return (
              <div key={doctor._id} className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-14 overflow-hidden">
                        {doctor.user?.profilePicture ? <img src={doctor.user.profilePicture} alt={doctor.user.name} className="w-full h-full object-cover" /> : <span className="text-xl">{doctor.user?.name?.[0] || 'D'}</span>}
                      </div>
                    </div>
                    <div>
                      <button type="button" onClick={() => setDoctorDetails(doctor)} className="card-title text-lg text-left hover:text-primary">{doctor.user?.name || 'Dr. Name'}</button>
                      <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <p className="text-sm text-gray-600">Experience: {doctor.experienceYears || doctor.experience || 'N/A'} Years</p>
                  <p className="text-sm text-gray-600">Chamber: {chamberLoc}</p>
                  <p className="text-lg font-bold text-secondary mt-2">৳ {doctor.consultationFee || doctor.fee || 300}</p>

                  <div className="card-actions justify-end mt-4">
                    <button 
                      onClick={() => handleOpenModal(doctor)} 
                      className="btn btn-primary btn-sm w-full"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {doctorDetails && (
        <div className="modal modal-open" onClick={() => setDoctorDetails(null)}>
          <div className="modal-box max-w-lg" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="avatar placeholder"><div className="bg-primary text-white rounded-full w-24 h-24 overflow-hidden">{doctorDetails.user?.profilePicture ? <img src={doctorDetails.user.profilePicture} alt={doctorDetails.user.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{doctorDetails.user?.name?.[0] || 'D'}</span>}</div></div>
              <div><h3 className="font-bold text-2xl text-slate-800">{doctorDetails.user?.name || 'Doctor'}</h3><p className="text-primary font-semibold">{doctorDetails.specialization || 'General Medicine'}</p><p className="text-sm text-slate-500">{doctorDetails.department || 'CampusClinic'}</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-sm">
              <p><strong>Education:</strong> {doctorDetails.degrees?.join(', ') || 'MBBS'}</p>
              <p><strong>Speciality:</strong> {doctorDetails.specialization || 'General Medicine'}</p>
              <p><strong>Experience:</strong> {doctorDetails.experienceYears || 'N/A'} years</p>
              <p><strong>Registration:</strong> {doctorDetails.bmdcRegistrationNumber || 'Pending verification'}</p>
              <p><strong>Chamber:</strong> {doctorDetails.roomNumber || 'Campus Medical Center'}</p>
              <p><strong>Consultation:</strong> ৳{doctorDetails.consultationFee || 300}</p>
            </div>
            {doctorDetails.bio && <p className="text-sm text-slate-600 mt-4">{doctorDetails.bio}</p>}
            <div className="modal-action"><button type="button" onClick={() => { setSelectedDoctor(doctorDetails); setDoctorDetails(null); }} className="btn btn-primary text-white">Book Appointment</button><button type="button" onClick={() => setDoctorDetails(null)} className="btn btn-ghost">Close</button></div>
          </div>
        </div>
      )}

      {/* Dynamic Booking Modal */}
      {selectedDoctor && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-1">Book Appointment</h3>
            <p className="text-xs font-semibold text-primary mb-4">
              {selectedDoctor.user?.name || selectedDoctor.name} ({selectedDoctor.specialization})
            </p>

            {bookingStatus.message && (
              <div className="alert alert-success mb-4 text-xs font-semibold">{bookingStatus.message}</div>
            )}
            {bookingStatus.error && (
              <div className="alert alert-error mb-4 text-xs font-semibold">{bookingStatus.error}</div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Consultation Mode Selector */}
              <div>
                <label className="label font-semibold text-xs text-gray-600 uppercase">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentType('offline');
                      setTimeSlot('');
                    }}
                    className={`btn btn-sm ${appointmentType === 'offline' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    🏢 Offline Chamber
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentType('online');
                      setTimeSlot('');
                    }}
                    className={`btn btn-sm ${appointmentType === 'online' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    💻 Online Call
                  </button>
                </div>
              </div>

              {/* Location Info & Schedule Days */}
              <div className="p-2.5 bg-base-200 rounded-lg text-xs text-gray-600 space-y-1">
                {appointmentType === 'offline' ? (
                  <p>📍 <strong>Chamber:</strong> {activeLocation}</p>
                ) : (
                  <p>⚡ <strong>Telemedicine:</strong> Video call link provided upon booking.</p>
                )}
                {visitingDays.length > 0 && (
                  <p>📅 <strong>Visiting Days:</strong> {visitingDays.join(', ')}</p>
                )}
              </div>

              {/* Select Date */}
              <div>
                <label className="label font-semibold text-xs text-gray-600 uppercase">Select Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="input input-bordered input-sm w-full"
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setTimeSlot('');
                  }}
                />
              </div>

              {/* Dynamic Time Slots Grid */}
              <div>
                <label className="label font-semibold text-xs text-gray-600 uppercase">
                  Available Slots {availableSlots.length > 0 && `(${availableSlots.length})`}
                </label>
                
                {dateNotSelected ? (
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium text-center border border-blue-200">
                    📅 Please select a date above to view available slots.
                  </div>
                ) : isOffDay ? (
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold text-center border border-amber-200">
                    ⚠️ Doctor is off on {selectedDay}s. Available days: {visitingDays.join(', ')}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg text-xs font-semibold text-center border border-red-200">
                    No available time slots found for this day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-base-200 rounded-lg">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`btn btn-xs ${timeSlot === slot ? 'btn-primary font-bold' : 'btn-ghost border-base-300'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Health Description */}
              <div>
                <label className="label font-semibold text-xs text-gray-600 uppercase">Health Issues / Description</label>
                <textarea
                  required
                  rows="2"
                  className="textarea textarea-bordered w-full text-xs"
                  placeholder="Describe your health problem..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingStatus.loading || !timeSlot || !bookingDate}
                  className="btn btn-primary btn-sm"
                >
                  {bookingStatus.loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctors;