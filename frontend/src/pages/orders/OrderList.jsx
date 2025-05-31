import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteOrder, getOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown,FaDownload, FaEye, FaChevronLeft,FaChevronRight} from 'react-icons/fa';
import { createReturnReplace } from '../../api/returnReplace';
import ReturnReplaceModal from './ReturnReplaceModal';
import { TbTruckReturn } from "react-icons/tb";
export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnReplaceModal, setShowReturnReplaceModal] = useState(false);
const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isCompleted: '',
    printingStatus: '',
    dispatchStatus: '',
    limit: 10
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { user } = useAuth();

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };
const handleOpenReturnReplace = (order) => {
  setSelectedOrder(order);
  setShowReturnReplaceModal(true);
};

// 4. Function to handle submitting the return/replace request:
const handleSubmitReturnReplace = async (formData) => {
  try {
    await createReturnReplace(formData);
    toast.success('Return/Replace request created successfully!');
    setShowReturnReplaceModal(false);
    setSelectedOrder(null);
    fetchOrders(pagination.currentPage); // refresh the list
  } catch (error) {
    // Error toast is already handled in the API util
  }
};

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchOrders = useCallback(async (page = 1, resetPage = false) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: debouncedSearch,
        page: resetPage ? 1 : page
      };
      
      const data = await getOrders(params);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
      
      if (resetPage) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchOrders(1, true);
  }, [debouncedSearch, filters.sortBy, filters.sortOrder, filters.isCompleted, filters.printingStatus, filters.dispatchStatus, filters.limit]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newOrder
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await deleteOrder(id);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
      toast.success('Order deleted successfully');
      
      if (orders.length === 1 && pagination.currentPage > 1) {
        handlePageChange(pagination.currentPage - 1);
      } else {
        fetchOrders(pagination.currentPage);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle export
  // const handleExport = async () => {
  //   try {
  //     setIsExporting(true);
  //     await exportOrders({
  //     await exportOrders({
  //       ...filters,
  //       search: debouncedSearch
  //     });
  //   } catch (error) {
  //     console.error('Export error:', error);
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (filters.sortBy !== field) return <FaSort className="text-gray-400" />;
    return filters.sortOrder === 'asc' ? 
      <FaSortUp className="text-white" /> : 
      <FaSortDown className="text-white" />;
  };

  // Loading component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
     
        <div
          className="absolute top-0 left-0 w-full h-4 z-10"
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #facc15 50%, #2563eb 100%)',
            boxShadow: '0 2px 8px 0 rgba(37,99,235,0.10)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
          }}
        />

        <div className="pt-8 pb-6 px-4 md:px-8">
        
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Order List
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total: {pagination.totalOrders} orders
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition flex items-center gap-2"
              >
                <FaFilter size={14} />
                Filters
              </button>
              
              {/* <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <FaDownload size={14} />
                {isExporting ? 'Exporting...' : 'Export'}
              </button> */}
              
              <Link
                to="/orders/create-bulk"
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                + Upload CSV
              </Link>
              
              <Link
                to="/orders/create"
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                + Create Order
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, email, or order ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show:
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Completion Status
                  </label>
                  <select
                    value={filters.isCompleted}
                    onChange={(e) => handleFilterChange('isCompleted', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">All Orders</option>
                    <option value="true">Completed</option>
                    <option value="false">Incomplete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Printing Status
                  </label>
                  <select
                    value={filters.printingStatus}
                    onChange={(e) => handleFilterChange('printingStatus', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dispatch Status
                  </label>
                  <select
                    value={filters.dispatchStatus}
                    onChange={(e) => handleFilterChange('dispatchStatus', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      search: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                      isCompleted: '',
                      printingStatus: '',
                      dispatchStatus: '',
                      limit: 10
                    })}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                  <th className="py-3 px-4">No</th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort('_id')}
                  >
                    <div className="flex items-center gap-2">
                      Order ID
                      {renderSortIcon('_id')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort('user.name')}
                  >
                    <div className="flex items-center gap-2">
                      Customer
                      {renderSortIcon('user.name')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Books</th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort('status.printing')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {renderSortIcon('status.printing')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {renderSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order._id}
                    className={`transition-all duration-200 ${
                      i % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50 dark:bg-gray-900'
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                  >
                    <td className="py-3 px-4">{(pagination.currentPage - 1) * pagination.limit + i + 1}</td>
                    <td className="py-3 px-4 font-mono text-sm">{order._id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.user.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {order.books.length} book{order.books.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                          order.status.printing === 'Done'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : order.status.printing === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                        }`}>
                          Print: {order.status.printing}
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                          order.status.dispatch === 'Delivered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : order.status.dispatch === 'Dispatched'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                        }`}>
                          Ship: {order.status.dispatch}
                        </span>
                        {order.isCompleted && (
                          <span className="inline-block px-2 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 items-center">
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 font-semibold transition"
                          title="View Order"
                        >
                          <FaEye size={18} />
                        </Link>
                        <Link
                          to={`/orders/${order._id}/edit`}
                          className="inline-flex items-center text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 font-semibold transition"
                          title="Edit Order"
                        >
                          <FaEdit size={18} />
                        </Link>
                        <button 
                          type='button' 
                          onClick={() => handleDelete(order._id)} 
                          className="inline-flex items-center text-red-500 hover:text-red-700 transition cursor-pointer"
                          aria-label="Delete Order"
                          title="Delete Order"
                        >
                          <FaTrash size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReturnReplace(order)}
                          className="inline-flex items-center text-yellow-600 hover:text-yellow-900 transition cursor-pointer"
                          aria-label="Return/Replace Order"
                          title="Return/Replace"
                          disabled={order.hasActiveReturn}
                        >
                          <TbTruckReturn size={20}/>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">📦</div>
                        <div>
                          <p className="font-bold text-lg mb-2">No orders found</p>
                          <p className="text-sm">
                            {filters.search || filters.isCompleted !== '' || filters.printingStatus || filters.dispatchStatus
                              ? 'Try adjusting your search or filters'
                              : 'Create your first order to get started'
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)} of{' '}
                  {pagination.totalOrders} orders
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <FaChevronLeft size={12} />
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                          pageNum === pagination.currentPage
                            ? 'text-white bg-blue-600 hover:bg-blue-700'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Next
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showReturnReplaceModal && selectedOrder && (
  <ReturnReplaceModal
    order={selectedOrder}
    onClose={() => setShowReturnReplaceModal(false)}
    onSubmit={handleSubmitReturnReplace}
  />
)}
    </div>
  );
};