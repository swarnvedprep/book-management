import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'executive', 'councellor', 'operations_manager'] },
  { to: '/return-list', label: 'Return', roles: ['admin', 'executive', 'councellor', 'operations_manager'] },
  { to: '/books', label: 'Books', roles: ['admin'] },
  { to: '/bundles', label: 'Bundles', roles: ['admin'] },
  { to: '/users', label: 'Users', roles: ['admin'] },
  { to: '/orders', label: 'Orders', roles: ['admin', 'executive', 'councellor'] },
  { to: '/app-data', label: 'App Req', roles: ['admin', 'executive', 'councellor'] },
  { to: '/mannual-data', label: 'Mannual Req', roles: ['admin', 'executive', 'councellor'] },
  { to: '/reports/stock', label: 'Reports', roles: ['admin', 'operations_manager'] },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-yellow-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
          Book Management
        </Link>
        <button
          onClick={toggleMenu}
          className="lg:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-2">
          {isAuthenticated && navLinks.filter(link => link.roles.includes(user?.role)).map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md font-medium transition 
                ${isActive ? 'bg-gradient-to-r from-blue-600 to-yellow-400 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-yellow-400'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
              >
                Logout
              </button>
              <span className="ml-2 text-xs bg-gradient-to-r from-blue-100 via-yellow-100 to-blue-100 text-blue-800 dark:text-yellow-300 px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow">
                {user?.role}
              </span>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${menuOpen ? 'block' : 'hidden'}`}>
          {/* Solid background for mobile menu */}
          <div className="absolute inset-0" />
          <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white dark:bg-gray-900 shadow-xl p-6 rounded-l-3xl flex flex-col gap-4 animate-slideIn z-50">
            <button
              onClick={toggleMenu}
              className="self-end text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400"
              aria-label="Close menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {isAuthenticated && navLinks.filter(link => link.roles.includes(user?.role)).map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg font-medium transition text-lg
                  ${isActive || location.pathname === link.to
                    ? 'bg-gradient-to-r from-blue-600 to-yellow-400 text-white shadow'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-yellow-400'}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 mt-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
                >
                  Logout
                </button>
                <span className="mt-2 text-xs bg-gradient-to-r from-blue-100 via-yellow-100 to-blue-100 text-blue-800 dark:text-yellow-300 px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow self-start">
                  {user?.role}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile slide-in animation */}
      <style>{`
        @media (max-width:1024px) {
          .max-w-[1024px] { max-width: 100vw !important; }
        }
        .animate-slideIn {
          animation: slideIn 0.25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
