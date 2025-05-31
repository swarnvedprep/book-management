import { toast } from "react-toastify";
import { deleteUsers, getUsers } from "../../api/users";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggle, setToggle] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response?.data) {
        setUsers(response.data);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsers(id);
      setToggle(prev => !prev);
      toast.success("User deleted successfully.");
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [toggle]);

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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              User List
            </h1>
            <Link
              to="/users/add"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              + Add User
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-lg text-gray-500 dark:text-gray-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-gray-800 dark:text-gray-100">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-600 dark:bg-blue-700 text-white">
                    <th className="py-4 px-6 font-semibold text-base">S.No</th>
                    <th className="py-4 px-6 font-semibold text-base">Name</th>
                    <th className="py-4 px-6 font-semibold text-base">Email</th>
                    <th className="py-4 px-6 font-semibold text-base">Phone Number</th>
                    <th className="py-4 px-6 font-semibold text-base">Role</th>
                    <th className="py-4 px-6 font-semibold text-base">Created At</th>
                    <th className="py-4 px-6 font-semibold text-base text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`transition-all duration-200 group ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-900'
                      } hover:bg-blue-50 dark:hover:bg-gray-700`}
                    >
                      <td className="py-3 px-6">{idx + 1}</td>
                      <td className="py-3 px-6">{user.name}</td>
                      <td className="py-3 px-6">{user.email}</td>
                      <td className="py-3 px-6">{user.phoneNumber}</td>
                      <td className="py-3 px-6 capitalize">{user.role}</td>
                      <td className="py-3 px-6">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-4">
                          <Link
                            to={`/users/${user._id}`}
                            title="Edit"
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 010 2.828l-10 10A2 2 0 016 16H4a1 1 0 01-1-1v-2a2 2 0 01.586-1.414l10-10a2 2 0 012.828 0z" />
                              <path d="M15 4l1 1" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(user._id)}
                            title="Delete"
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3.5a.5.5 0 000 1H4v10a2 2 0 002 2h8a2 2 0 002-2V5h.5a.5.5 0 000-1H15V3a1 1 0 00-1-1H6zm1 4a.5.5 0 011 0v8a.5.5 0 01-1 0V6zm4 0a.5.5 0 011 0v8a.5.5 0 01-1 0V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
