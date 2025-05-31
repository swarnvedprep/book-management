import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getStockReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/stock`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch stock report');
    throw error;
  }
};

export const getFinancialReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/financial`, {
      withCredentials: true
    });
    console.log(response);
    
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch financial report');
    throw error;
  }
};

export const getOrderStatusReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/order-status`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch order status report');
    throw error;
  }
};
export const incrementStock = async (id, incrementBy) => {
  try {
    const response = await axios.put(`${API_URL}/reports/stock/increment/${id}`, { incrementBy }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update stock');
    throw error;
  }
};

export const deleteStock = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reports/stock/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete stock');
    throw error;
  }
};