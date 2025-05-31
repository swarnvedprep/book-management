import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getFinancialReport, getOrderStatusReport } from '../api/reports';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [financialData, setFinancialData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const financial = await getFinancialReport();
        setFinancialData(financial);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    const fetchOrderStatus = async () => {
      try {
        const data = await getOrderStatusReport();
        setStatusData(data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchDashboardData();
      fetchOrderStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto  change-later">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-10 text-center tracking-tight">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Welcome Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-b-2xl rounded-t-md shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 transition">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-t-2xl" />
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-1">Welcome, {user?.name}</h2>
          <div className="text-gray-500 dark:text-gray-300 text-sm mb-2">
            Role: <span className="capitalize font-semibold text-gray-800 dark:text-gray-100">{user?.role}</span>
          </div>
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              to={user?.role === 'admin' ? '/books' : '/orders'}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 shadow transition"
            >
              <span>Go to {user?.role === 'admin' ? 'Books' : 'Orders'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </Link>
            {(user?.role === 'operations_manager' || user?.role === 'admin') && (
              <Link
                to="/reports/stock"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-blue-700 dark:text-blue-300 font-semibold rounded-lg px-4 py-2 shadow transition"
              >
                <span>View Reports</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
        </div>

        {/* Financial Overview */}
        {financialData && (
          <div className="relative bg-white dark:bg-gray-800 rounded-b-2xl rounded-t-md shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 transition">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-t-2xl" />
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3">Financial Overview</h2>
            <div className="flex flex-col gap-3 text-base">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Total Revenue:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">₹{financialData?.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Total Profit:</span>
                <span className={`font-semibold ${financialData?.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  ₹{financialData?.totalProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Total Orders:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{financialData?.totalOrders}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Status */}
        {statusData && (
          <div className="relative bg-white dark:bg-gray-800 rounded-b-2xl rounded-t-md shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 transition">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-t-2xl" />
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3">Order Status</h2>
            <div className="flex flex-col gap-3 text-base">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Pending Printing:</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-300">{statusData?.printing?.Pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Pending Dispatch:</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-300">{statusData?.dispatch?.Pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Delivered:</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{statusData?.dispatch?.Delivered}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="relative bg-white dark:bg-gray-800 rounded-b-2xl rounded-t-md shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 transition">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-t-2xl" />
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(user?.role === 'executive' || user?.role === 'councellor') && (
            <Link
              to="/orders/create"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow transition"
            >
              <span>Create New Order</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/books/create"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow transition"
            >
              <span>Add New Book</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            </Link>
          )}
          {(user?.role === 'operations_manager' || user?.role === 'admin') && (
            <Link
              to="/reports/financial"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-blue-700 dark:text-blue-300 font-semibold px-5 py-3 rounded-lg shadow transition"
            >
              <span>View Financial Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
