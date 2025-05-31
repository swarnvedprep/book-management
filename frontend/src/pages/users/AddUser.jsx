import { useEffect, useState } from "react";
import { getUserById, registerUser, updateUser } from "../../api/users";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const AddUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
  });

  const fetchUser = async () => {
    if (!id) return;
    try {
      const response = await getUserById(id);
      setData((prev) => ({ ...prev, ...response?.data?.data }));
    } catch (error) {
      toast.error("Failed to fetch user details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        const response = await updateUser(id, data);
        toast.success(response.message);
      } else {
        if (!data.password) {
          toast.error("Please add the Password");
          return;
        }
        const response = await registerUser(data);
        toast.success(response.message);
      }
      navigate("/users");
    } catch (error) {
      toast.error("Failed to save user.");
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container mx-auto  change-later">
      <div className="relative max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            {id ? "Edit User" : "Add User"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="mb-1 font-medium text-gray-700 dark:text-gray-200 block">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 font-medium text-gray-700 dark:text-gray-200 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter Email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 font-medium text-gray-700 dark:text-gray-200 block">
                  Password
                </label>
                <input
                  type="text"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter Password"
                  required={!id}
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="mb-1 font-medium text-gray-700 dark:text-gray-200 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={data.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter Phone Number"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="role" className="mb-1 font-medium text-gray-700 dark:text-gray-200 block">
                  Role
                </label>
                <select
                  name="role"
                  value={data.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="executive">Executive</option>
                  <option value="councellor">Councellor</option>
                  <option value="operations_manager">Operations Manager</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-md px-6 py-2 text-white transition"
              >
                {id ? "Update User" : "Add User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
