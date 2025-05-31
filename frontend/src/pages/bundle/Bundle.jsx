import { useState, useEffect } from 'react';
import { getBundles, createBundle, updateBundle, deleteBundle } from '../../api/bundles';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';

const formatIST = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

export const BundleList = () => {
  const [bundles, setBundles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // bundle object or null
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const data = await getBundles();
      setBundles(data);
    } catch {
      toast.error('Failed to fetch bundles');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (bundle) => {
    setEditing(bundle);
    setForm({ name: bundle.name, description: bundle.description });
    setShowModal(true);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      let bundle;
      if (editing) {
        bundle = await updateBundle(editing._id, form);
        setBundles(bundles.map(b => (b._id === editing._id ? bundle : b)));
        toast.success('Bundle updated!');
      } else {
        bundle = await createBundle(form);
        setBundles([...bundles, bundle]);
        toast.success('Bundle created!');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bundle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;
    try {
      await deleteBundle(id);
      setBundles(bundles.filter(b => b._id !== id));
      toast.success('Bundle deleted!');
    } catch (error) {
      toast.error('Failed to delete bundle');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="relative  bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
        <div className="pt-8 pb-6 px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Bundles
            </h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
            >
              + Add Bundle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Created At (IST)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : bundles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-500 font-bold text-lg">
                      No bundles found.
                    </td>
                  </tr>
                ) : (
                  bundles.map((b, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="py-3 px-4 font-semibold">{i+1}</td>
                      <td className="py-3 px-4 font-semibold">{b.name}</td>
                      <td className="py-3 px-4 whitespace-pre-line max-w-xs">{b.description}</td>
                      <td className="py-3 px-4">{formatIST(b.createdAt)}</td>
                      <td className="py-3 px-4 text-center flex gap-3 justify-center">
                        <button
                          onClick={() => openEditModal(b)}
                          className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          title="Edit"
                        >
                          <FaEdit/>
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="text-red-600 hover:text-red-800 transition cursor-pointer"
                          title="Delete"
                        >
                          <FaTrash/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 transition">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full p-8 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
              {editing ? 'Edit Bundle' : 'Add Bundle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bundle Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Bundle Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition"
                >
                  {editing ? 'Update Bundle' : 'Add Bundle'}
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
