import { useState, useEffect } from 'react';
import { 
  getAllReturnReplaceRequests, 
  getReturnReplaceById, 
  processReturnReplace, 
  deleteReturnReplace,
  getReturnReplaceStats
} from '../../api/returnReplace';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaFileAlt } from 'react-icons/fa';
const formatIST = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusColors = {
  Requested: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
};

const typeColors = {
  Return: 'bg-orange-100 text-orange-800',
  Replacement: 'bg-indigo-100 text-indigo-800'
};

export const ReturnReplaceList = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [processData, setProcessData] = useState({
    action: 'approve',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filters, pagination.currentPage]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.limit
      };
      const data = await getAllReturnReplaceRequests(params);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getReturnReplaceStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchRequestDetails = async (id) => {
    try {
      const request = await getReturnReplaceById(id);
      setSelectedRequest(request);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to fetch request details');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleProcessChange = (e) => {
    const { name, value } = e.target;
    setProcessData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const openProcessModal = (request, action) => {
    setSelectedRequest(request);
    setProcessData({
      action,
      transactionId: '',
      notes: ''
    });
    setShowProcessModal(true);
  };

  const processRequest = async () => {
    try {
      await processReturnReplace(selectedRequest._id, processData);
      toast.success(`Request ${processData.action}d successfully!`);
      setShowProcessModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to process request');
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await deleteReturnReplace(id);
      toast.success('Request deleted successfully!');
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  return (
    <div className="container mx-auto min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="relative bg-white p-4 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      
        <div
          className="absolute top-0 left-0 w-full h-4 z-10"
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #facc15 50%, #2563eb 100%)',
            boxShadow: '0 2px 8px 0 rgba(37,99,235,0.10)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
          }}
        />
        
          <div className="flex flex-col md:flex-row md:justify-between md:items-center my-2 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Return/Replacement Requests
            </h1>
            {stats && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="text-sm text-blue-600 dark:text-blue-300">Total Requests</div>
                  <div className="text-xl font-bold text-blue-800 dark:text-blue-200">{stats.totalRequests}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-100 dark:border-yellow-900">
                  <div className="text-sm text-yellow-600 dark:text-yellow-300">Active Requests</div>
                  <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200">{stats.activeRequests}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name, phone or transaction ID"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="flex gap-2">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">All Types</option>
                  <option value="Return">Return</option>
                  <option value="Replacement">Replacement</option>
                </select>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">All Statuses</option>
                  <option value="Requested">Requested</option>
                  <option value="Approved">Approved</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={() => setFilters({ type: '', status: '', search: '' })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <FaFilter className="text-gray-600 dark:text-gray-300" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 dark:text-gray-500 font-bold text-lg">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request, i) => (
                    <tr
                      key={request._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="py-3 px-4 font-semibold">{i+1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{request.order?.transactionId}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.order?.user?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColors[request.type]}`}>
                          {request.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[request.status]}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        ₹{request.financials?.totalOrderValue?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4">{formatIST(request.createdAt)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => fetchRequestDetails(request._id)}
                            className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                            title="View Details"
                          >
                            <FaFileAlt />
                          </button>
                          {request.status === 'Requested' && (
                            <>
                              <button
                                onClick={() => openProcessModal(request, 'approve')}
                                className="text-green-600 hover:text-green-800 transition cursor-pointer"
                                title="Approve"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => openProcessModal(request, 'reject')}
                                className="text-red-600 hover:text-red-800 transition cursor-pointer"
                                title="Reject"
                              >
                                ×
                              </button>
                            </>
                          )}
                          {request.status === 'Approved' && (
                            <button
                              onClick={() => openProcessModal(request, 'complete')}
                              className="text-purple-600 hover:text-purple-800 transition cursor-pointer"
                              title="Complete"
                            >
                              ✓✓
                            </button>
                          )}
                          {['Requested', 'Approved'].includes(request.status) && (
                            <button
                              onClick={() => deleteRequest(request._id)}
                              className="text-red-600 hover:text-red-800 transition cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border-t border-b border-gray-300 dark:border-gray-600 ${pagination.currentPage === page ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 transition">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl w-full p-8 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              onClick={() => setShowDetailsModal(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Request Details #{selectedRequest._id.slice(-6)}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Order Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID:</span>
                    <div className="font-medium">{selectedRequest.order?.transactionId || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Customer:</span>
                    <div className="font-medium">
                      {selectedRequest.order?.user?.name || 'N/A'} ({selectedRequest.order?.user?.phoneNumber || 'N/A'})
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Order Date:</span>
                    <div className="font-medium">{formatIST(selectedRequest.order?.createdAt)}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Request Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${typeColors[selectedRequest.type]}`}>
                      {selectedRequest.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${statusColors[selectedRequest.status]}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created At:</span>
                    <div className="font-medium">{formatIST(selectedRequest.createdAt)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created By:</span>
                    <div className="font-medium">{selectedRequest.createdBy?.name || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-2 px-4 border-b text-left">Book</th>
                      <th className="py-2 px-4 border-b text-left">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">Reason</th>
                      {selectedRequest.type === 'Replacement' && (
                        <th className="py-2 px-4 border-b text-left">Replacement Book</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2 px-4">
                          <div className="font-medium">{item.book?.examName} - {item.book?.subject}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.book?.sku}</div>
                        </td>
                        <td className="py-2 px-4">{item.affectedQuantity}</td>
                        <td className="py-2 px-4">{item.reason}</td>
                        {selectedRequest.type === 'Replacement' && (
                          <td className="py-2 px-4">
                            {item.replacementBook ? (
                              <>
                                <div className="font-medium">{item.replacementBook?.examName} - {item.replacementBook?.subject}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.replacementBook?.sku}</div>
                              </>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Financials</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Order Value:</span>
                    <span className="font-medium">₹{selectedRequest.financials?.totalOrderValue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Amount:</span>
                    <span className="font-medium">₹{selectedRequest.financials?.refundAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span className="font-medium">₹{selectedRequest.financials?.shippingCharges?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
              
              {selectedRequest.resolution && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Resolution</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Processed By:</span>
                      <div className="font-medium">{selectedRequest.resolution.processedBy?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Processed At:</span>
                      <div className="font-medium">{formatIST(selectedRequest.resolution.processedAt)}</div>
                    </div>
                    {selectedRequest.resolution.transactionId && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID:</span>
                        <div className="font-medium">{selectedRequest.resolution.transactionId}</div>
                      </div>
                    )}
                    {selectedRequest.resolution.notes && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Notes:</span>
                        <div className="font-medium whitespace-pre-line">{selectedRequest.resolution.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Process Request Modal */}
      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 transition">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full p-8 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              onClick={() => setShowProcessModal(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
              {processData.action === 'approve' && 'Approve Request'}
              {processData.action === 'complete' && 'Complete Request'}
              {processData.action === 'reject' && 'Reject Request'}
            </h2>
            
            <div className="mb-4">
              <div className="font-semibold">Request #{selectedRequest._id.slice(-6)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedRequest.type} - {selectedRequest.status}
              </div>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); processRequest(); }} className="space-y-4">
              {processData.action === 'complete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={processData.transactionId}
                    onChange={handleProcessChange}
                    required={processData.action === 'complete'}
                    placeholder="Enter transaction/reference ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={processData.notes}
                  onChange={handleProcessChange}
                  placeholder="Enter any notes or comments"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 cursor-pointer text-white rounded-md font-semibold transition ${
                    processData.action === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {processData.action === 'approve' && 'Approve Request'}
                  {processData.action === 'complete' && 'Complete Request'}
                  {processData.action === 'reject' && 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};