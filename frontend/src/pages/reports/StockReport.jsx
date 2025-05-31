import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deleteStock, getStockReport, incrementStock } from '../../api/reports';
import { FaTrash, FaEdit } from 'react-icons/fa';
export const StockReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [toggle,setToggle] = useState(false);
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getStockReport();
        setReport(data);
      } catch (error) {
        toast.error('Failed to fetch stock report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [toggle]);
const [editingStock, setEditingStock] = useState(null);
const [incrementValue, setIncrementValue] = useState('');

const handleEditClick = (item) => {
  setEditingStock(item);
  setIncrementValue('');
  setShowModal(true);
};

const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this stock?')) {
    await deleteStock(id);
     setToggle(prev => !prev);
  }
};

const handleIncrement = async (e) => {
  e.preventDefault();
  const value = parseInt(incrementValue, 10);
  if (!value || value <= 0) {
    toast.error('Please enter a valid positive number');
    return;
  }
  await incrementStock(editingStock._id, value);
  setShowModal(false);
  setToggle(prev => !prev);
};

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
            Stock Report
          </h1>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Book</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Ordered</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`transition-all duration-200 ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50 dark:bg-gray-900'
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                  >
                    <td className="py-3 px-4">{idx + 1}</td>
                    <td className="py-3 px-4">{item.book.sku}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{item.book.examName} {item.book.courseName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.book.subject}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{item.totalStock}</td>
                    <td className="py-3 px-4">{item.orderedStock}</td>
                    <td className="py-3 px-4">{item.currentStock}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold
                        ${item.currentStock <= 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : item.currentStock < 10
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        }`}>
                        {item.currentStock <= 0 ? 'Out of Stock'
                          : item.currentStock < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => handleEditClick(item)} className="cursor-pointer">
                        <FaEdit className="text-blue-500 hover:text-blue-700" />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="cursor-pointer">
                        <FaTrash className="text-red-500 hover:text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))}
                {report.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500 font-bold text-lg">
                      No stock data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {showModal && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md pointer-events-auto">
      <h2 className="text-xl font-bold mb-2">Update Stock</h2>
      <p className="mb-4 text-gray-700 dark:text-gray-200">
        <span className="font-semibold">Book:</span> {editingStock.book.examName} {editingStock.book.courseName} ({editingStock.book.subject})
      </p>
      <form onSubmit={handleIncrement} className="space-y-4">
        <input
          type="number"
          min="1"
          value={incrementValue}
          onChange={e => setIncrementValue(e.target.value)}
          placeholder="Enter quantity to add"
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setShowModal(false)} className="btn curor-pointer bg-red-600 text-white rounded m-1 p-2 cursor-pointer">Cancel</button>
          <button type="submit" className="btn curor-pointer bg-green-600 text-white rounded m-1 p-2 cursor-pointer">Add Stock</button>
        </div>
      </form>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};
