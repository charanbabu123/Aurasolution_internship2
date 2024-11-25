import React from 'react';
import { Upload as UploadIcon, Download, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  onUpload: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  file,
  isUploading,
  uploadSuccess,
  uploadError,
  onFileSelect,
  onDownloadTemplate,
  onUpload,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Inventory Management System
      </h1>

      <div className="mb-8">
        <button
          onClick={onDownloadTemplate}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          Download CSV Template
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8">
        <input
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex flex-col items-center"
        >
          <UploadIcon size={48} className="text-gray-400 mb-4" />
          <span className="text-gray-600 text-lg mb-2">
            Click to upload or drag and drop your CSV file
          </span>
          <span className="text-sm text-gray-500">
            {file ? file.name : 'No file selected'}
          </span>
        </label>
      </div>

      {uploadSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          File uploaded successfully!
        </div>
      )}

      {uploadError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{uploadError}</span>
          </div>
        </div>
      )}

      <button
        onClick={onUpload}
        disabled={!file || isUploading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
          !file || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Data'}
      </button>
    </div>
  );
};

export default FileUpload;