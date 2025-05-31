import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getBooks } from "../../api/books";
import { getBundles } from "../../api/bundles";
import { toast } from "react-toastify";
import Select from "react-select";

const REASONS = [
  "Damaged",
  "Wrong Item",
  "Quality Issue",
  "Printing Error",
  "Customer Request",
  "Other",
];

export default function ReturnReplaceModal({ order, onClose, onSubmit }) {
  const [type, setType] = useState("Return");
  const [items, setItems] = useState([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [allBundles, setAllBundles] = useState([]);
  const [activeTab, setActiveTab] = useState("bundle");
  const [selectedBundle, setSelectedBundle] = useState(null);

  // Only bundles present in the order
  const orderBundleIds = [
    ...new Set(order.books.map((b) => b.book.bundle?._id || b.book.bundle).filter(Boolean)),
  ];

  // Only books present in the order
  const orderBookIds = order.books.map((b) => b.book._id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [books, bundles] = await Promise.all([getBooks(), getBundles()]);
        // Only include bundles that are part of the order
        setAllBundles(bundles.filter((bundle) => orderBundleIds.includes(bundle._id)));
        // Only include books that are part of the order
        setAllBooks(books.filter((book) => orderBookIds.includes(book._id)));
      } catch (err) {
        toast.error("Failed to fetch books or bundles");
      }
    };
    fetchData();
  }, [order._id]);

  useEffect(() => {
    if (order.books && allBooks.length > 0) {
      const initialItems = order.books.map((b) => {
        const book = allBooks.find((book) => book._id === b.book._id) || b.book;
        return {
          book: book._id,
          title: book.title,
          sku: book.sku,
          examName: book.examName,
          courseName: book.courseName,
          bundle: book.bundle?._id || book.bundle,
          orderedQuantity: b.quantity,
          affectedQuantity: 0,
          reason: "",
          replacementBook: null,
          replacementQuantity: 0,
          available: book.stock?.currentStock || 0,
          stockStatus: getStockStatus(book.stock?.currentStock || 0),
        };
      });
      setItems(initialItems);
    }
  }, [order.books, allBooks]);

  function getStockStatus(currentStock) {
    if (currentStock <= 0) return "Out of Stock";
    if (currentStock < 5) return "Low Stock";
    return "In Stock";
  }

  function getStockStatusClass(status) {
    switch (status) {
      case "Out of Stock":
        return "text-red-600 bg-red-50";
      case "Low Stock":
        return "text-yellow-600 bg-yellow-50";
      case "In Stock":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600";
    }
  }

  const handleBundleSelect = (bundleId) => {
    if (!bundleId) {
      setSelectedBundle(null);
      return;
    }
    const selected = allBundles.find((b) => b._id === bundleId);
    if (!selected) return;
    setSelectedBundle(selected);
    const bundleBookIds = allBooks
      .filter((b) => (b.bundle === bundleId || b.bundle?._id === bundleId))
      .map((b) => b._id);
    setItems((prev) =>
      prev.map((item) => {
        if (bundleBookIds.includes(item.book)) {
          return { ...item, affectedQuantity: item.orderedQuantity };
        }
        return { ...item, affectedQuantity: 0 };
      })
    );
  };

//   const handleManualBookSelect = (selectedOptions) => {
//     const selectedBookIds = selectedOptions.map((opt) => opt.value);
//     setItems((prev) =>
//       prev.map((item) => ({
//         ...item,
//         affectedQuantity: selectedBookIds.includes(item.book)
//           ? item.orderedQuantity
//           : 0,
//       }))
//     );
//   };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const validate = () => {
    const affectedItems = items.filter((item) => item.affectedQuantity > 0);
    if (affectedItems.length === 0) return "Please select at least one item.";
    for (const item of affectedItems) {
      if (!item.reason) return "Please select a reason for all affected items.";
      if (item.affectedQuantity > item.orderedQuantity)
        return "Affected quantity cannot exceed ordered quantity.";
      if (type === "Replacement") {
        if (!item.replacementBook) return "Please select a replacement book.";
        if (!item.replacementQuantity || item.replacementQuantity <= 0)
          return "Replacement quantity must be positive.";
      }
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const filteredItems = items
      .filter((item) => item.affectedQuantity > 0)
      .map((item) => ({
        book: item.book,
        affectedQuantity: Number(item.affectedQuantity),
        reason: item.reason,
        ...(type === "Replacement"
          ? {
              replacementBook: item.replacementBook,
              replacementQuantity: Number(item.replacementQuantity),
            }
          : {}),
      }));
    onSubmit({
      orderId: order._id,
      type,
      items: filteredItems,
      adminNotes,
    });
  };

  const renderSelectedBooks = () => (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Book
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ordered Qty
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Affected Qty
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            {type === "Replacement" && (
              <>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Replacement Book
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Replacement Qty
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, idx) => {
            const statusClass = getStockStatusClass(item.stockStatus);
            const isOutOfStock = item.available < item.affectedQuantity;
            return (
              <tr key={item.book} className={isOutOfStock ? "bg-red-50" : ""}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {item.sku}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.examName} {item.courseName}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 text-center">
                  {item.orderedQuantity}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
                  >
                    <span className="ml-1">{item.available} available</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min="0"
                    max={item.orderedQuantity}
                    value={item.affectedQuantity}
                    onChange={(e) =>
                      handleItemChange(
                        idx,
                        "affectedQuantity",
                        Math.max(
                          0,
                          Math.min(
                            item.orderedQuantity,
                            Number(e.target.value)
                          )
                        )
                      )
                    }
                    className={`w-16 px-2 py-1 border rounded text-center ${
                      isOutOfStock ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.reason}
                    onChange={(e) =>
                      handleItemChange(idx, "reason", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                    disabled={item.affectedQuantity === 0}
                  >
                    <option value="">Select Reason</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                {type === "Replacement" && (
                  <>
                    <td className="px-4 py-3">
                      <select
                        value={item.replacementBook || ""}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "replacementBook",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1"
                        disabled={item.affectedQuantity === 0}
                      >
                        <option value="">Select Book</option>
                        {allBooks.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.sku} - {b.examName} {b.courseName} (
                            {b.stock?.currentStock || 0} in stock)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.replacementQuantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "replacementQuantity",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        className={`w-16 px-2 py-1 border rounded text-center ${
                          isOutOfStock ? "border-red-300" : "border-gray-300"
                        }`}
                        disabled={item.affectedQuantity === 0}
                      />
                    </td>
                  </>
                )}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Bundle
        </label>
        <select
          value={selectedBundle?._id || ""}
          onChange={(e) => handleBundleSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Choose a bundle</option>
          {allBundles.map((bundle) => (
            <option key={bundle._id} value={bundle._id}>
              {bundle.name}
            </option>
          ))}
        </select>
      </div>
      {renderSelectedBooks()}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Add Individual Books
          </h3>
          <span className="text-sm text-gray-500">
            Add books outside the bundle
          </span>
        </div>
        <Select
          options={order.books
            .filter(
              (orderBook) =>
                !items.some(
                  (i) =>
                    i.book === orderBook.book._id && i.affectedQuantity > 0
                )
            )
            .map((orderBook) => {
              const book =
                allBooks.find((b) => b._id === orderBook.book._id) ||
                orderBook.book;
              return {
                value: book._id,
                label: `${book.sku} - ${book.examName} ${book.courseName} (${
                  book.stock?.currentStock || 0
                } in stock)`,
                isDisabled: book.stock?.currentStock <= 0,
              };
            })}
          onChange={(selected) => {
            if (selected) {
              const idx = items.findIndex((i) => i.book === selected.value);
              if (idx >= 0) {
                handleItemChange(
                  idx,
                  "affectedQuantity",
                  items[idx].orderedQuantity
                );
              }
            }
          }}
          placeholder="Search for books to add..."
          className="basic-multi-select"
          classNamePrefix="select"
          noOptionsMessage={() =>
            "No books available or all books already selected"
          }
          isOptionDisabled={(option) => option.isDisabled}
        />
      </div>
    </div>
  );

  const ManualTab = () => {
    const bookOptions = order.books.map((orderBook) => {
      const book =
        allBooks.find((b) => b._id === orderBook.book._id) || orderBook.book;
      return {
        value: book._id,
        label: `${book.sku} - ${book.examName} ${book.courseName} (${
          book.stock?.currentStock || 0
        } in stock)`,
        isDisabled: book.stock?.currentStock <= 0,
      };
    });
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Books
          </label>
          <Select
            isMulti
            name="books"
            options={bookOptions}
            value={items
              .filter((item) => item.affectedQuantity > 0)
              .map((item) => {
                const book = allBooks.find((b) => b._id === item.book);
                return {
                  value: item.book,
                  label: `${book?.sku} - ${book?.examName} ${book?.courseName} (${
                    book?.stock?.currentStock || 0
                  } in stock)`,
                };
              })}
            onChange={(selected) => {
              setItems((prev) =>
                prev.map((item) => ({ ...item, affectedQuantity: 0 }))
              );
              selected.forEach((sel) => {
                const idx = items.findIndex((i) => i.book === sel.value);
                if (idx >= 0) {
                  handleItemChange(
                    idx,
                    "affectedQuantity",
                    items[idx].orderedQuantity
                  );
                }
              });
            }}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Search and select books..."
            noOptionsMessage={() => "No books available"}
            isOptionDisabled={(option) => option.isDisabled}
          />
        </div>
        {renderSelectedBooks()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-6xl p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
         X
        </button>
        <h2 className="text-xl font-bold mb-4">
          {type} Request for Order #{order._id.slice(-6)}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mr-4 font-semibold">Type:</label>
            <label className="inline-flex items-center mr-4">
              <input
                type="radio"
                name="type"
                value="Return"
                checked={type === "Return"}
                onChange={() => setType("Return")}
                className="form-radio"
              />
              <span className="ml-2">Return</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="Replacement"
                checked={type === "Replacement"}
                onChange={() => setType("Replacement")}
                className="form-radio"
              />
              <span className="ml-2">Replacement</span>
            </label>
          </div>
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
                  onClick={() => setActiveTab("bundle")}
                  className={`${
                    activeTab === "bundle"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-md`}
                >
                  Bundle Selection
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`${
                    activeTab === "manual"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-md`}
                >
                  Manual Selection
                </button>
              </nav>
            </div>
          </div>
          {activeTab === "bundle" ? <BundleTab /> : <ManualTab />}
          <div className="mt-6">
            <label className="block font-semibold mb-1">
              Admin Notes (optional):
            </label>
            <textarea
              className="w-full border rounded p-2"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="text-red-600 my-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
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
}

ReturnReplaceModal.propTypes = {
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
