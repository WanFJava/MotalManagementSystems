import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/invoices';
const PAYMENT_API_URL = 'http://localhost:5000/api/payment';

export const invoiceClientService = {
  getAllInvoices: async (params = {}) => {
    const res = await axios.get(API_BASE_URL, { params });
    return res.data.data || [];
  },

  getInvoiceById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  generateInvoice: async (invoiceData) => {
    const res = await axios.post(`${API_BASE_URL}/generate`, invoiceData);
    return res.data;
  },

  payCash: async (invoiceId, note = 'Thu tiền mặt trực tiếp') => {
    const res = await axios.post(`${API_BASE_URL}/${invoiceId}/pay-cash`, { note });
    return res.data;
  },

  createVNPayUrl: async (invoiceId, returnUrl) => {
    const res = await axios.post(`${PAYMENT_API_URL}/create-payment-url`, { invoiceId, returnUrl });
    return res.data;
  },

  confirmVNPayReturn: async (queryParams) => {
    const res = await axios.get(`${PAYMENT_API_URL}/vnpay-return`, { params: queryParams });
    return res.data;
  },

  deleteInvoice: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  }
};
