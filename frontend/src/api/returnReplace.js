import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const createReturnReplace = async (requestData) => {
  try {
    const response = await axios.post(`${API_URL}/return-replace`, requestData, {
      withCredentials: true,
    })
    toast.success('Return/Replace request created successfully!')
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create return/replace request')
    throw error
  }
}

export const getAllReturnReplaceRequests = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/return-replace`, {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    toast.error('Failed to fetch return/replace requests')
    throw error
  }
}

export const getReturnReplaceById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/return-replace/${id}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    toast.error('Failed to fetch return/replace request')
    throw error
  }
}

export const processReturnReplace = async (id, processData) => {
  try {
    const response = await axios.put(`${API_URL}/return-replace/${id}/process`, processData, {
      withCredentials: true,
    })
    toast.success(`Request ${processData.action}ed successfully!`)
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to process request')
    throw error
  }
}

export const deleteReturnReplace = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/return-replace/${id}`, {
      withCredentials: true,
    })
    toast.success('Request deleted successfully!')
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete request')
    throw error
  }
}

export const getReturnReplaceStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/return-replace/stats`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    toast.error('Failed to fetch return/replace stats')
    throw error
  }
}