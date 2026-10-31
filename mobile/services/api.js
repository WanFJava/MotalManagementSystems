import axios from 'axios';
import { Platform } from 'react-native';

// Địa chỉ IP của backend:
// - Android Emulator: 10.0.2.2
// - iOS Simulator hoặc Web: localhost
// - Thiết bị thật: IP mạng LAN (ví dụ 192.168.1.x)
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rentalRequestApi = {
  createRequest: (data) => api.post('/rental-requests', data),
  getRequests: (params) => api.get('/rental-requests', { params }),
  getRequestById: (id) => api.get(`/rental-requests/${id}`),
  updateStatus: (id, status) => api.put(`/rental-requests/${id}`, { status }),
};

export const contractApi = {
  createContract: (data) => api.post('/contracts', data),
  getContracts: () => api.get('/contracts'),
  getContractById: (id) => api.get(`/contracts/${id}`),
  extendContract: (id, endDate) => api.put(`/contracts/${id}/extend`, { endDate }),
  terminateContract: (id) => api.put(`/contracts/${id}/terminate`),
};

export const roomApi = {
  getRooms: () => api.get('/rooms'),
};

// ==========================================
// CÁC HÀM API PHỤ TRÁCH BỞI MẠNH (THÀNH VIÊN 4)
// ==========================================

export const getRooms = async () => {
  const res = await api.get('/rooms');
  return res.data?.data || [];
};

export const getUtilities = async (params = {}) => {
  const res = await api.get('/utilities', { params });
  return res.data?.data || [];
};

export const getUtilityByRoom = async (roomId) => {
  const res = await api.get(`/utilities/${roomId}`);
  return res.data?.data;
};

export const recordUtility = async (data) => {
  const res = await api.post('/utilities', data);
  return res.data;
};

export const generateInvoice = async (data) => {
  const res = await api.post('/invoices/generate', data);
  return res.data;
};

export const getInvoices = async (params = {}) => {
  const res = await api.get('/invoices', { params });
  return res.data?.data || [];
};

export const getInvoiceById = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data?.data;
};

export const createPaymentUrl = async (invoiceId) => {
  const res = await api.post('/payment/create-payment-url', { invoiceId });
  return res.data;
};

export const payCash = async (invoiceId, note) => {
  const res = await api.put(`/invoices/${invoiceId}/payment`, { note });
  return res.data;
};

export const getPaymentTransactions = async () => {
  const res = await api.get('/payment/transactions');
  return res.data?.data || [];
};

export default api;
