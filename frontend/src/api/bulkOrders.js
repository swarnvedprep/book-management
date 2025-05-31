import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createBulkOrders = async (csvFile) => {
  try {
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    const response = await axios.post(`${API_URL}/bulk-orders`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });

    if (response.data.success === true) {
      toast.success(response.data.message);
    } else if (response.data.success === 'partial') {
      toast.warning(response.data.message);
    }

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to process bulk orders';
    toast.error(errorMessage);
    throw error;
  }
};