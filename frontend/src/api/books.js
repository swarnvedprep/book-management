import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/books`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    toast.error('Failed to fetch books')
    throw error
  }
}

export const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/books/${id}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    toast.error('Failed to fetch book')
    throw error
  }
}

export const updateBook = async (id, bookData) => {
  try {
    const response = await axios.put(`${API_URL}/books/${id}`, bookData, {
      withCredentials: true,
    })
    toast.success('Book updated successfully!')
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update book')
    throw error
  }
}

export const createBook = async (bookData) => {
  try {
    const response = await axios.post(`${API_URL}/books`, bookData, {
      withCredentials: true,
    })
    toast.success('Book created successfully!')
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create book')
    throw error
  }
}
