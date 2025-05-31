import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getBundles = async () => {
  const response = await axios.get(`${API_URL}/bundles`, { withCredentials: true });
  return response.data;
};

export const createBundle = async (bundleData) => {
  const response = await axios.post(`${API_URL}/bundles`, bundleData, { withCredentials: true });
  return response.data;
};
export const updateBundle = async (id, bundleData) => {
  const response = await axios.put(`${API_URL}/bundles/${id}`, bundleData, { withCredentials: true });
  return response.data;
};

export const deleteBundle = async (id) => {
  const response = await axios.delete(`${API_URL}/bundles/${id}`, { withCredentials: true });
  return response.data;
};