import api from '../config/axios';

export const createPrescription = async (prescriptionData) => {
  const response = await api.post('/prescriptions', prescriptionData);
  return response.data;
};

export const getPrescriptionByAppointment = async (appointmentId) => {
  const response = await api.get(`/prescriptions/appointment/${appointmentId}`);
  return response.data;
};