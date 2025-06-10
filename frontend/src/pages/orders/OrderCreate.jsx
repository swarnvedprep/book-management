import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { createOrder, getOrderById, updateOrder } from '../../api/orders';
import { getBooks } from '../../api/books';
import { getBundles } from '../../api/bundles';
import { useAuth } from '../../context/AuthContext';

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

export const OrderForm = () => {
  const { orderId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = !!orderId;
  
  const [activeTab, setActiveTab] = useState('bundle');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [availableBundles, setAvailableBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [totalPrice, setTotalPrice] = useState(0);

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      user: {
        name: '',
        email: '',
        phoneNumber: '',
        alternateNumber: '',
        pinCode: '',
        address: '',
        landmark: '',
        state: '',
        city: ''
      },
      bundles: [],
      books: [],
      transactionId: '',
      courier: {
        type: '',
        charges: 0,
        trackingId: ''
      },
      status: {
        printing: 'Pending',
        dispatch: 'Pending'
      },
       isCompleted: false
    };

    if (state?.prefillData) {
      return {
        ...defaultData,
        user: {
          ...defaultData.user,
          ...state.prefillData.user
        },
        transactionId: state.prefillData.transactionId || '',
        courier: {
          ...defaultData.courier,
          ...state.prefillData.courier
        },
        isCompleted: state.prefillData.isCompleted || false
      };
    }

    return defaultData;
  });
const handleCheckboxChange = (e) => {
  const { name, checked } = e.target;
  console.log(checked);
  
  setFormData(prev => ({
    ...prev,
    [name]: checked
  }));
};
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [books, bundles] = await Promise.all([getBooks(), getBundles()]);
        
        // Enhance book data with stock information
        const enhancedBooks = books.map(book => ({
          ...book,
          stockStatus: getStockStatus(book.stock?.currentStock || 0)
        }));
        
        setAvailableBooks(enhancedBooks);
        setAvailableBundles(bundles);
        
        if (isEditMode) {
          const order = await getOrderById(orderId);
          if (order) {
            if (order.bundles && order.bundles.length > 0) {
              const bundle = bundles.find(b => b._id === order.bundles[0]);
              setSelectedBundle(bundle || null);
              setActiveTab('bundle');
            } else {
              setActiveTab('manual');
            }
            
            const transformedBooks = order.books.map(item => {
              const book = enhancedBooks.find(b => b._id === item.book._id) || item.book;
              return {
                book: book._id,
                quantity: item.quantity,
                available: book.stock?.currentStock || 0,
                stockStatus: getStockStatus(book.stock?.currentStock || 0)
              };
            });
            
            setFormData({
              ...order,
              books: transformedBooks
            });
          }
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [orderId, isEditMode]);

  useEffect(() => {
    const calculateTotal = () => {
      return formData.books.reduce((sum, item) => {
        const book = availableBooks.find(b => b._id === item.book);
        return sum + (book?.sellPrice || 0) * item.quantity;
      }, 0);
    };
    setTotalPrice(calculateTotal());
  }, [formData.books, availableBooks]);

  const getStockStatus = (currentStock) => {
    if (currentStock <= 0) return 'Out of Stock';
    if (currentStock < 5) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusClass = (status) => {
    switch (status) {
      case 'Out of Stock': return 'text-red-600 bg-red-50';
      case 'Low Stock': return 'text-yellow-600 bg-yellow-50';
      case 'In Stock': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('user.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [field]: value
        }
      }));
    } else if (name.includes('courier.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        courier: {
          ...prev.courier,
          [field]: field === 'charges' ? parseFloat(value) || 0 : value
        }
      }));
    } else if (name.includes('status.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        status: {
          ...prev.status,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBundleSelect = async (bundleId) => {
    if (!bundleId) {
      setSelectedBundle(null);
      setFormData(prev => ({
        ...prev,
        bundles: [],
        books: []
      }));
      return;
    }

    const selected = availableBundles.find(b => b._id === bundleId);
    if (!selected) return;

    setSelectedBundle(selected);
    
    const bundleBooks = availableBooks.filter(b => 
      b.bundle === bundleId || 
      (b.bundle?._id && b.bundle._id === bundleId)
    );
    
    setFormData(prev => ({
      ...prev,
      bundles: [selected._id],
      books: bundleBooks.map(book => ({
        book: book._id,
        quantity: 1,
        available: book.stock?.currentStock || 0,
        stockStatus: getStockStatus(book.stock?.currentStock || 0)
      }))
    }));
  };

  const handleManualBookSelect = (selectedOptions) => {
    const selectedBooks = selectedOptions.map(option => {
      const book = availableBooks.find(b => b._id === option.value);
      return {
        book: option.value,
        quantity: 1,
        available: book?.stock?.currentStock || 0,
        stockStatus: getStockStatus(book?.stock?.currentStock || 0)
      };
    });
    
    if (activeTab === 'manual') {
      setSelectedBundle(null);
      setFormData(prev => ({ 
        ...prev,
        bundles: [],
        books: selectedBooks 
      }));
    }
  };

  const handleQuantityChange = (bookId, quantity) => {
    if (quantity < 1) return;
    setFormData(prev => ({
      ...prev,
      books: prev.books.map(b => 
        b.book === bookId ? { ...b, quantity } : b
      )
    }));
  };

  const handleRemoveBook = (bookId) => {
    setFormData(prev => ({
      ...prev,
      books: prev.books.filter(b => b.book !== bookId)
    }));
  };

  const handleAddBook = (bookId) => {
    const book = availableBooks.find(b => b._id === bookId);
    if (!book) return;

    setFormData(prev => ({
      ...prev,
      books: [...prev.books, {
        book: bookId,
        quantity: 1,
        available: book.stock?.currentStock || 0,
        stockStatus: getStockStatus(book.stock?.currentStock || 0)
      }]
    }));
  };

  const validateForm = () => {
    if (formData.books.length === 0) {
      toast.error('Please select at least one book');
      return false;
    }

    if (!formData.transactionId) {
      toast.error('Transaction ID is required');
      return false;
    }

    if (!formData.courier.type || formData.courier.charges === undefined) {
      toast.error('Courier information is required');
      return false;
    }

    const outOfStockBooks = formData.books.filter(item => {
      const book = availableBooks.find(b => b._id === item.book);
      return (book?.stock?.currentStock || 0) < item.quantity;
    });

    if (outOfStockBooks.length > 0) {
      const bookNames = outOfStockBooks.map(item => {
        const book = availableBooks.find(b => b._id === item.book);
        return `${book?.sku} - ${book?.examName} ${book?.courseName}`;
      }).join(', ');
      
      toast.warning(`Warning: Some books have insufficient stock: ${bookNames}`);
      return true;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        totalPrice,
        createdBy: user._id,
        updatedBy: isEditMode ? user._id : undefined,
        books: formData.books.map(b => ({
          book: b.book,
          quantity: b.quantity
        }))
      };
      
      if (isEditMode) {
        await updateOrder(orderId, orderData);
        toast.success('Order updated successfully!');
      } else {
        await createOrder(orderData);
        toast.success('Order created successfully!');
      }
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} order`);
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedBooks = () => (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {formData.books.map(({ book, quantity }) => {
            const b = availableBooks.find(x => x._id === book);
            const stockStatus = b?.stock?.currentStock ? getStockStatus(b.stock.currentStock) : 'Unknown';
            const statusClass = getStockStatusClass(stockStatus);
            const isOutOfStock = b?.stock?.currentStock < quantity;
            
            return (
              <tr key={book} className={isOutOfStock ? "bg-red-50" : ""}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{b?.sku}</div>
                  <div className="text-sm text-gray-500">{b?.examName} {b?.courseName}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{b?.subject}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                    {isOutOfStock ? <WarningIcon /> : <CheckIcon />}
                    <span className="ml-1">
                      {b?.stock?.currentStock || 0} available
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-500">₹{b?.sellPrice || 0}</td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(book, parseInt(e.target.value))}
                    className={`w-16 px-2 py-1 border rounded text-center ${isOutOfStock ? 'border-red-300' : 'border-gray-300'}`}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveBook(book)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const BundleTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Bundle</label>
        <select
          value={selectedBundle?._id || ''}
          onChange={(e) => handleBundleSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Choose a bundle</option>
          {availableBundles.map(bundle => (
            <option key={bundle._id} value={bundle._id}>
              {bundle.name}
            </option>
          ))}
        </select>
      </div>

      {formData.books.length > 0 && renderSelectedBooks()}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Add Individual Books</h3>
          <span className="text-sm text-gray-500">Add books outside the bundle</span>
        </div>
        <Select
          options={availableBooks
            .filter(book => !formData.books.some(b => b.book === book._id))
            .map(book => ({
              value: book._id,
              label: `${book.sku} - ${book.examName} ${book.courseName} (${book.stock?.currentStock || 0} in stock)`,
              isDisabled: book.stock?.currentStock <= 0
            }))}
          onChange={(selected) => selected && handleAddBook(selected.value)}
          placeholder="Search for books to add..."
          className="basic-multi-select"
          classNamePrefix="select"
          noOptionsMessage={() => "No books available or all books already added"}
          isOptionDisabled={(option) => option.isDisabled}
        />
      </div>
    </div>
  );

  const ManualTab = () => {
    const bookOptions = availableBooks.map(book => ({
      value: book._id,
      label: `${book.sku} - ${book.examName} ${book.courseName} (${book.stock?.currentStock || 0} in stock)`,
      isDisabled: book.stock?.currentStock <= 0
    }));

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Books</label>
          <Select
            isMulti
            name="books"
            options={bookOptions}
            value={formData.books.map(b => {
              const book = availableBooks.find(book => book._id === b.book);
              return {
                value: b.book,
                label: `${book?.sku} - ${book?.examName} ${book?.courseName} (${book?.stock?.currentStock || 0} in stock)`
              };
            })}
            onChange={handleManualBookSelect}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Search and select books..."
            noOptionsMessage={() => "No books available or all books already added"}
            isOptionDisabled={(option) => option.isDisabled}
          />
        </div>

        {formData.books.length > 0 && renderSelectedBooks()}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Order' : 'Create New Order'}
        </h1>
        <div className="text-sm text-gray-500 flex items-center">
          <CalendarIcon />
          <span className="ml-1">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Customer Information</h2>
            {isEditMode && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Editing
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="user.name"
                value={formData.user.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="user.email"
                value={formData.user.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="user.phoneNumber"
                value={formData.user.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Number</label>
              <input
                type="text"
                name="user.alternateNumber"
                value={formData.user.alternateNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
              <input
                type="text"
                name="user.pinCode"
                value={formData.user.pinCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="user.address"
                value={formData.user.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              <input
                type="text"
                name="user.landmark"
                value={formData.user.landmark}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="user.state"
                value={formData.user.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="user.city"
                value={formData.user.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Book Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Books</h2>
          
          <div className="mb-6">
            <div className="sm:hidden">
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="bundle">Bundle Selection</option>
                <option value="manual">Manual Selection</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-4 border-b" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('bundle')}
                  className={`${
                    activeTab === 'bundle'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-md`}
                  aria-current={activeTab === 'bundle' ? 'page' : undefined}
                >
                  Bundle Selection
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`${
                    activeTab === 'manual'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-md`}
                  aria-current={activeTab === 'manual' ? 'page' : undefined}
                >
                  Manual Selection
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'bundle' ? <BundleTab /> : <ManualTab />}
        </div>

        {/* Order Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Courier Type</label>
              <select
                name="courier.type"
                value={formData.courier.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Courier</option>
                <option value="FedEx">FedEx</option>
                <option value="DHL">DHL</option>
                <option value="UPS">UPS</option>
                <option value="India Post">India Post</option>
                <option value="BlueDart">BlueDart</option>
                <option value="DTDC">DTDC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Courier Charges</label>
              <input
                type="number"
                name="courier.charges"
                value={formData.courier.charges}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID (optional)</label>
              <input
                type="text"
                name="courier.trackingId"
                value={formData.courier.trackingId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            name="isCompleted"
            id="isCompleted"
            checked={formData.isCompleted}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-700">
            Mark order as completed
          </label>
        </div>
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Books:</span>
              <span>{formData.books.length} items</span>
            </div>
            {formData.courier.charges > 0 && (
              <div className="flex justify-between">
                <span>Courier Charges:</span>
                <span>₹{formData.courier.charges}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Selected Books Price(₹):</span>
              <input type="number" className='border-2 rounded-md border' onChange={(e)=>setTotalPrice(parseInt(e.target.value))} value={totalPrice}/>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total Price:</span>
              <span>₹{(totalPrice + (formData.courier.charges || 0))}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};