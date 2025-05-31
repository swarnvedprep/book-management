import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBooks } from '../../api/books';
import { useAuth } from '../../context/AuthContext';

export const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (error) {
        toast.error('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto  change-later">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Book List
        </h1>
        {user?.role === 'admin' && (
          <Link
            to="/books/create"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
          >
            + Add New Book
          </Link>
        )}
      </div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Gradient accent line at the top, now more visible */}
        <div
          className="absolute top-0 left-0 w-full h-4 z-10"
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #facc15 50%, #2563eb 100%)',
            boxShadow: '0 2px 8px 0 rgba(37,99,235,0.15)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
          }}
        />

        <div className="overflow-x-auto pt-4"> {/* Add pt-4 to push table below the accent */}
          <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                <th className="py-4 px-6 font-semibold text-base">S.No</th>
                <th className="py-4 px-6 font-semibold text-base">SKU</th>
                <th className="py-4 px-6 font-semibold text-base">Exam</th>
                <th className="py-4 px-6 font-semibold text-base">Bundle</th>
                <th className="py-4 px-6 font-semibold text-base">Course</th>
                <th className="py-4 px-6 font-semibold text-base">Subject</th>
                <th className="py-4 px-6 font-semibold text-base">Price</th>
                <th className="py-4 px-6 font-semibold text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, idx) => (
                <tr
                  key={book._id}
                  className={`transition-all duration-200 group ${
                    idx % 2 === 0
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-900'
                  } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="py-4 px-6">{idx + 1}</td>
                  <td className="py-4 px-6">{book.sku}</td>
                  <td className="py-4 px-6">{book.examName}</td>
                  <td className="py-4 px-6">{book.bundle?.name || '-'}</td>
                  <td className="py-4 px-6">{book.courseName}</td>
                  <td className="py-4 px-6">{book.subject}</td>
                  <td className="py-4 px-6 font-semibold">&#8377; {book.sellPrice}</td>
                  <td className="py-4 px-6 space-x-2">
                    <Link
                      to={`/books/${book._id}`}
                      className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
                      title="View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 12H9m0 0l3-3m-3 3l3 3" /></svg>
                      View
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to={`/books/${book._id}/edit`}
                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-md shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 5h2m2 0a2 2 0 012 2v2m0 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m0-2V7a2 2 0 012-2h2" /></svg>
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 font-bold text-xl">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookList;
