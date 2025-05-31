import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getFinancialReport } from '../../api/reports';

export const FinancialReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getFinancialReport();
        setReport(data);
      } catch (error) {
        toast.error('Failed to fetch financial report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto  change-later">
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
        <div className="pt-8 pb-6 px-4 md:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Financial Report
          </h1>
          {report && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Total Orders</h3>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{report.totalOrders}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Total Revenue</h3>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">₹{report.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Total Costs</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{(report.totalPrintingCost + report.totalCourierCharges).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Total Profit</h3>
                  <p className={`text-2xl font-bold ${
                    report.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    ₹{report.totalProfit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">Detailed Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                        <th className="py-2 px-4">Order ID</th>
                        <th className="py-2 px-4">Date</th>
                        <th className="py-2 px-4">Revenue</th>
                        <th className="py-2 px-4">Printing Cost</th>
                        <th className="py-2 px-4">Courier Charges</th>
                        <th className="py-2 px-4">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.orders.map((order, idx) => (
                        <tr
                          key={order._id}
                          className={`transition-all duration-200 ${
                            idx % 2 === 0
                              ? 'bg-white dark:bg-gray-800'
                              : 'bg-gray-50 dark:bg-gray-900'
                          } hover:bg-blue-50 dark:hover:bg-gray-700`}
                        >
                          <td className="py-2 px-4">{order._id.slice(-6)}</td>
                          <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-4">₹{order.revenue.toFixed(2)}</td>
                          <td className="py-2 px-4">₹{order.printingCost.toFixed(2)}</td>
                          <td className="py-2 px-4">₹{order.courierCharges.toFixed(2)}</td>
                          <td className={`py-2 px-4 ${
                            order.profit >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            ₹{order.profit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {report.orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500 font-bold text-lg">
                            No orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
