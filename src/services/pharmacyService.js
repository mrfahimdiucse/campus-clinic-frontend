import api from '../config/axios';

export const getAllMedicines = async () => {
  const response = await api.get('/pharmacy');
  return response.data;
};

export const createPharmacyOrder = async (orderData) => {
  const response = await api.post('/pharmacy/order', orderData);
  return response.data;
};