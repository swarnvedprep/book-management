import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Unauthorized Access</h2>
        
        <p className="text-gray-600 mb-4">
          {user ? (
            `Your account (${user.role}) doesn't have permission to access this page.`
          ) : (
            'You need to be logged in to access this page.'
          )}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          {user ? (
            <>
              <button
                onClick={handleGoBack}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};