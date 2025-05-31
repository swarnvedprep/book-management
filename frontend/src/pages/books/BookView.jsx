import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookById } from '../../api/books';
import { useAuth } from '../../context/AuthContext';

export const BookView = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id);
        setBook(data);
      } catch (error) {
        toast.error('Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
    </div>
  );
  if (!book) return <div className="text-center py-8 text-gray-400 dark:text-gray-500">Book not found</div>;

  return (
    <div className="container mx-auto  change-later">
      <div className="relative max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Gradient accent line at the top */}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Book Details
            </h1>
            {user?.role === 'admin' && (
              <Link
                to={`/books/${book._id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
              >
                Edit Book
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">Basic Information</h2>
             <div className="space-y-2 text-gray-700 dark:text-gray-200">
              <p><span className="font-medium">SKU:</span> {book.sku}</p>
              <p><span className="font-medium">Exam:</span> {book.examName}</p>
              <p><span className="font-medium">Course:</span> {book.courseName}</p>
              <p><span className="font-medium">Subject:</span> {book.subject}</p>
              <p><span className="font-medium">Bundle:</span> {book.bundle?.name || '-'}</p>
            </div>

            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">Pricing</h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-200">
                <p><span className="font-medium">Printing Price:</span> ₹{book.printingPrice.toFixed(2)}</p>
                <p><span className="font-medium">Sell Price:</span> ₹{book.sellPrice.toFixed(2)}</p>
                <p><span className="font-medium">Profit Margin:</span> ₹{(book.sellPrice - book.printingPrice).toFixed(2)}</p>
              </div>
            </div>
            {book.description && (
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">Description</h2>
                <p className="text-gray-700 dark:text-gray-200">{book.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Link
              to="/books"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition"
            >
              &larr; Back to Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
