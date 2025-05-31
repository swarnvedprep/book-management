import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getOrderStatusReport } from '../../api/reports';

export const OrderStatusReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getOrderStatusReport();
        setReport(data?.statusReport);
      } catch (error) {
        toast.error('Failed to fetch order status report');
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
            Order Status Report
          </h1>
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">Printing Status</h2>
                <div className="space-y-3">
                  {Object.entries(report.printing).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="font-medium">{status}</span>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-3 py-1 rounded-full font-semibold">
                        {count} order{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-green-700 dark:text-green-400">Dispatch Status</h2>
                <div className="space-y-3">
                  {Object.entries(report.dispatch).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="font-medium">{status}</span>
                      <span className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-3 py-1 rounded-full font-semibold">
                        {count} order{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
