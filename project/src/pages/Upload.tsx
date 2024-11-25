import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Upload as UploadIcon, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const downloadTemplate = () => {
    const template = [
      ['Product Name', 'SKU', 'Category', 'Purchase Price', 'Selling Price', 'Stock Quantity'],
      ['Example Product', 'SKU123', 'Electronics', '100', '150', '50']
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateData = (data: any[]) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      if (!row['Product Name']) {
        errors.push(`Row ${index + 1}: Product Name is required`);
      }
      if (!row['SKU']) {
        errors.push(`Row ${index + 1}: SKU is required`);
      }
      if (isNaN(Number(row['Purchase Price']))) {
        errors.push(`Row ${index + 1}: Invalid Purchase Price`);
      }
      if (isNaN(Number(row['Selling Price']))) {
        errors.push(`Row ${index + 1}: Invalid Selling Price`);
      }
      if (isNaN(Number(row['Stock Quantity']))) {
        errors.push(`Row ${index + 1}: Invalid Stock Quantity`);
      }
    });

    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const validationErrors = validateData(results.data);
          setErrors(validationErrors);
        },
        error: (error) => {
          setErrors([error.message]);
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!file || errors.length > 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/');
    } catch (error: any) {
      console.error('Upload failed:', error.response?.data || error.message);
      setErrors([error.response?.data?.error || 'Failed to upload file. Please try again.']);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Upload Inventory Data
          </h1>

          <div className="mb-8">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Download size={20} />
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer flex flex-col items-center"
            >
              <UploadIcon size={48} className="text-gray-400 mb-4" />
              <span className="text-gray-600">
                Click to upload or drag and drop your CSV file
              </span>
              <span className="text-sm text-gray-500 mt-2">
                {file ? file.name : 'No file selected'}
              </span>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Validation Errors</span>
              </div>
              <ul className="list-disc list-inside text-red-600 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!file || errors.length > 0 || isUploading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                !file || errors.length > 0 || isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;