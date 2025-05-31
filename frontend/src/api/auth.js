import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);


export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Login failed');
  return response.json(); 
};

export const fetchMe = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Not authorized');
  return response.json();
};
export const logoutApi = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Not authorized');
  return response.json();
};