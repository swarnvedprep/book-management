import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch users");
    throw error;
  }
};

export const deleteUsers = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      withCredentials: true,
    });
    if (response.ok) {
      toast.success("User Delted Successfully");
      response.data;
    }
  } catch (error) {
    toast.error("Some Error Occured");
    console.log(error);
  }
};
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      withCredentials: true,
    });
    
    if (response.status === 200) {
      toast.success("User fetched Successfully");
     return response;
    }
  } catch (error) {
    toast.error("Some Error Occured");
    console.log(error);
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, data, {
      withCredentials: true,
    });
    toast.success("User Updated Successfully.");
    return response.data;
  } catch (error) {
    toast.error("Some Error Occurred.");
    console.log(error);
  }
};
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData, {
      withCredentials: true 
    });
    toast.success('User registered successfully!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Registration failed');
    throw error;
  }
};