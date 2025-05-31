import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      withCredentials: true
    });
    toast.success('Order created successfully!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create order');
    throw error;
  }
};

export const getOrders = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isCompleted,
      printingStatus,
      dispatchStatus
    } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (search.trim()) {
      queryParams.append('search', search.trim());
    }
    
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    
    if (isCompleted !== undefined && isCompleted !== '') {
      queryParams.append('isCompleted', isCompleted.toString());
    }
    
    if (printingStatus && printingStatus !== '') {
      queryParams.append('printingStatus', printingStatus);
    }
    
    if (dispatchStatus && dispatchStatus !== '') {
      queryParams.append('dispatchStatus', dispatchStatus);
    }

    const response = await axios.get(`${API_URL}/orders?${queryParams.toString()}`, {
      withCredentials: true,
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('Get orders error:', error);
    
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.response?.status === 401) {
      toast.error('Unauthorized access. Please login again.');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error('Failed to fetch orders');
    }
    
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    if (!id) {
      throw new Error('Order ID is required');
    }

    const response = await axios.delete(`${API_URL}/orders/${id}`, {
      withCredentials: true,
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Delete order error:', error);
    
    if (error.response?.status === 404) {
      toast.error('Order not found');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to delete this order');
    } else if (error.response?.status === 401) {
      toast.error('Unauthorized access. Please login again.');
    } else {
      toast.error('Failed to delete order');
    }
    
    throw error;
  }
};


export const getOrderById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch order details');
    throw error;
  }
};

export const updatePrintingStatus = async (id, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/orders/${id}/printing`,
      { status },
      { withCredentials: true }
    );
    toast.success('Printing status updated!');
    return response.data;
  } catch (error) {
    toast.error('Failed to update printing status');
    throw error;
  }
};

export const updateDispatchStatus = async (id, status, trackingId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/orders/${id}/dispatch`,
      { status, trackingId },
      { withCredentials: true }
    );
    toast.success('Dispatch status updated!');
    return response.data;
  } catch (error) {
    toast.error('Failed to update dispatch status');
    throw error;
  }
};
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(`${API_URL}/orders/${orderId}`, orderData,  { withCredentials: true });
    return response.data.order;
  } catch (error) {
    console.error('Update order error:', error);
    throw error;
  }
};


// Bulk delete orders
// export const bulkDeleteOrders = async (orderIds) => {
//   try {
//     if (!Array.isArray(orderIds) || orderIds.length === 0) {
//       throw new Error('Order IDs array is required');
//     }

//     const response = await axios.delete(`${API_URL}/orders/bulk`, {
//       data: { orderIds },
//       withCredentials: true,
//       timeout: 15000
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('Bulk delete orders error:', error);
//     toast.error('Failed to delete selected orders');
//     throw error;
//   }
// };

// Export order data to CSV
// export const exportOrders = async (params = {}) => {
//   try {
//     const queryParams = new URLSearchParams();
    
//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== undefined && value !== '') {
//         queryParams.append(key, value.toString());
//       }
//     });

//     const response = await axios.get(`${API_URL}/orders/export?${queryParams.toString()}`, {
//       withCredentials: true,
//       responseType: 'blob',
//       timeout: 30000
//     });
    
//     // Create download link
//     const blob = new Blob([response.data], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
    
//     toast.success('Orders exported successfully');
//     return true;
//   } catch (error) {
//     console.error('Export orders error:', error);
//     toast.error('Failed to export orders');
//     throw error;
//   }
// };