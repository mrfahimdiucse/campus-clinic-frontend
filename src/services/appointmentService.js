import api from '../config/axios';

export const bookAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await api.get('/appointments/my-appointments');
  return response.data;
};

export const getDoctorAppointments = async () => {
  const response = await api.get('/appointments/doctor-appointments');
  return response.data;
};

export const updateAppointmentStatus = async (id, status, extra = {}) => {
  const response = await api.patch(`/appointments/${id}`, { status, ...extra });
  return response.data;
};