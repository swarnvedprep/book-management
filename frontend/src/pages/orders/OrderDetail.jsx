import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrderById, updatePrintingStatus, updateDispatchStatus } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        toast.error('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePrintingStatus = async (status) => {
    setUpdating(true);
    try {
      await updatePrintingStatus(id, status);
      setOrder(prev => ({
        ...prev,
        status: {
          ...prev.status,
          printing: status
        }
      }));
    } catch (error) {
      toast.error('Failed to update printing status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDispatchStatus = async (status) => {
    setUpdating(true);
    try {
      await updateDispatchStatus(id, status, order.courier.trackingId);
      setOrder(prev => ({
        ...prev,
        status: {
          ...prev.status,
          dispatch: status
        }
      }));
    } catch (error) {
      toast.error('Failed to update dispatch status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
    </div>
  );
  if (!order) return <div className="text-center py-8 text-gray-400 dark:text-gray-500">Order not found</div>;

  return (
    <div className="container mx-auto ">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Gradient accent line */}
        <div
          className="absolute top-0 left-0 w-full h-4 z-10"
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #facc15 50%, #2563eb 100%)',
            boxShadow: '0 2px 8px 0 rgba(37,99,235,0.10)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
          }}
        />
        <div className="pt-8 pb-6 px-6 md:px-10 space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order Details
            </h1>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold transition"
            >
              &larr; Back to Orders
            </Link>
          </div>

          {/* Customer Information */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200">
              <div>
                <p><span className="font-medium">Name:</span> {order.user.name}</p>
                <p><span className="font-medium">Email:</span> {order.user.email}</p>
                <p><span className="font-medium">Phone:</span> {order.user.phoneNumber}</p>
              </div>
              <div>
                <p><span className="font-medium">Address:</span> {order.user.address}</p>
                <p><span className="font-medium">City:</span> {order.user.city}, {order.user.state}</p>
                <p><span className="font-medium">Pincode:</span> {order.user.pinCode}</p>
              </div>
            </div>
          </section>

          {/* Order Information */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">Order Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200">
              <div>
                <p><span className="font-medium">Order ID:</span> {order._id}</p>
                <p><span className="font-medium">Transaction ID:</span> {order.transactionId}</p>
                <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p><span className="font-medium">Courier:</span> {order.courier.type}</p>
                <p><span className="font-medium">Tracking ID:</span> {order.courier.trackingId || 'Not available'}</p>
                <p><span className="font-medium">Courier Charges:</span> ₹{order.courier.charges.toFixed(2)}</p>
              </div>
            </div>
          </section>

          {/* Books Table */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">Books</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-blue-600 dark:bg-blue-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-4 text-left">SKU</th>
                    <th className="py-2 px-4 text-left">Exam</th>
                    <th className="py-2 px-4 text-left">Course</th>
                    <th className="py-2 px-4 text-left">Subject</th>
                    <th className="py-2 px-4 text-left">Qty</th>
                    <th className="py-2 px-4 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.books.map((item, idx) => (
                    <tr
                      key={item.book._id}
                      className={`transition-all duration-200 ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-900'
                      } hover:bg-blue-50 dark:hover:bg-gray-700`}
                    >
                      <td className="py-2 px-4">{item.book.sku}</td>
                      <td className="py-2 px-4">{item.book.examName}</td>
                      <td className="py-2 px-4">{item.book.courseName}</td>
                      <td className="py-2 px-4">{item.book.subject}</td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      <td className="py-2 px-4">₹{(item.book.sellPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Order Status */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">Order Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium mb-2">Printing Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'In Progress', 'Done'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handlePrintingStatus(status)}
                      disabled={updating || order.status.printing === status}
                      className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                        order.status.printing === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium mb-2">Dispatch Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Dispatched', 'Delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleDispatchStatus(status)}
                      disabled={updating || order.status.dispatch === status ||
                        (status === 'Dispatched' && order.status.printing !== 'Done') ||
                        (status === 'Delivered' && order.status.dispatch !== 'Dispatched')
                      }
                      className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                        order.status.dispatch === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${
                        (status === 'Dispatched' && order.status.printing !== 'Done') ||
                        (status === 'Delivered' && order.status.dispatch !== 'Dispatched')
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
