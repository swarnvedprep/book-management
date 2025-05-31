import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Layout = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-12">{children}</main>
    </div>
  );
};

export default Layout;