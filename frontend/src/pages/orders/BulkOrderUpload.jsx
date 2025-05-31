import React, { useState, useRef } from 'react';
import {
  MdCloudUpload,
  MdDescription,
  MdError,
  MdCheckCircle,
  MdDownload,
  MdInfo,
} from 'react-icons/md';
import { createBulkOrders } from '../../api/bulkOrders';
import { Link } from 'react-router-dom';

const BulkOrderUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const csvTemplate = `name,fatherName,college,email,phoneNumber,alternateNumber,pinCode,address,landmark,state,city,bundleNames,kitType,batchType,orderType,payment,remainingPayment,remark,transactionId,courierType,courierCharges
John Doe,Mr. Doe,ABC College,john@email.com,9876543210,9876543211,110001,123 Main St,Near Park,Delhi,New Delhi,"Bundle A,Bundle B",Standard,Morning,Regular,1500,500,Priority order,TXN123456,Express,100
Jane Smith,Mr. Smith,XYZ University,jane@email.com,9876543212,,110002,456 Oak Ave,,Delhi,New Delhi,Bundle C,Premium,Evening,Express,2000,0,Rush delivery,TXN123457,Standard,50`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_order_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a CSV file only');
        setFile(null);
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a CSV file only');
        setFile(null);
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await createBulkOrders(file);
      setUploadResult(result);

      if (result.success === true) {
        setTimeout(() => {
          onUploadSuccess?.(result);
          resetForm();
        }, 2000);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Network error occurred. Please try again.',
        error: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadResult(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Bulk Order Upload</h2>
          <Link
            to="/orders"
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Back to Orders
          </Link>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <MdInfo className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Download the CSV template below and fill in your order data</li>
                  <li>• Bundle names should be comma-separated (e.g., "Bundle A,Bundle B")</li>
                  <li>• All required fields must be filled</li>
                  <li>• Books will be automatically assigned based on bundles</li>
                  <li>• Upload will stop if any error occurs to maintain data integrity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MdDownload size={16} />
              Download CSV Template
            </button>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <MdDescription className="text-green-600" size={24} />
                  <div>
                    <p className="font-medium text-green-800">{file.name}</p>
                    <p className="text-sm text-green-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <MdCloudUpload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your CSV file here
                  </p>
                  <p className="text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="mb-6">
              <div
                className={`p-4 rounded-lg border ${
                  uploadResult.success === true
                    ? 'bg-green-50 border-green-200'
                    : uploadResult.success === 'partial'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {uploadResult.success === true ? (
                    <MdCheckCircle className="text-green-600 mt-0.5" size={20} />
                  ) : (
                    <MdError
                      className={`mt-0.5 ${
                        uploadResult.success === 'partial' ? 'text-yellow-600' : 'text-red-600'
                      }`}
                      size={20}
                    />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        uploadResult.success === true
                          ? 'text-green-800'
                          : uploadResult.success === 'partial'
                          ? 'text-yellow-800'
                          : 'text-red-800'
                      }`}
                    >
                      {uploadResult.message}
                    </p>

                    {uploadResult.processedOrders?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-green-700 mb-2">
                          Successfully Created Orders ({uploadResult.processedOrders.length}):
                        </p>
                        <div className="max-h-32 overflow-y-auto">
                          {uploadResult.processedOrders.map((order, index) => (
                            <div key={index} className="text-sm text-green-600 mb-1">
                              Row {order.row}: {order.customerName} - {order.transactionId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResult.failedOrders?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-700 mb-2">
                          Failed Orders ({uploadResult.failedOrders.length}):
                        </p>
                        <div className="max-h-32 overflow-y-auto">
                          {uploadResult.failedOrders.map((order, index) => (
                            <div key={index} className="text-sm text-red-600 mb-1">
                              Row {order.row}: {order.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`px-6 py-2 rounded-lg transition-colors ${
                !file || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Orders'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderUpload;
