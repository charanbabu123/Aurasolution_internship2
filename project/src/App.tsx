import React, { useState } from 'react';
import  Papa from 'papaparse';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

interface Product {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  profit: number;
  sales: number;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setUploadError('Please upload a valid CSV file');
        return;
      }
      setFile(file);
      setShowDashboard(false);
    }
  };

  const handleSubmit = () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      Papa.parse(csvData, {
        header: true,
        complete: (results) => {
          try {
            const parsedProducts = results.data
              .filter((row: any) => row['Product Name'] && row['SKU']) // Filter out empty rows
              .map((row: any) => ({
                name: row['Product Name'],
                sku: row['SKU'],
                category: row['Category'] || 'Uncategorized',
                purchasePrice: Number(row['Purchase Price']) || 0,
                sellingPrice: Number(row['Selling Price']) || 0,
                stockQuantity: Number(row['Stock Quantity']) || 0,
                profit: (Number(row['Selling Price']) || 0) - (Number(row['Purchase Price']) || 0),
                sales: Math.floor(Math.random() * 100) // Simulated sales data
              }));
            setProducts(parsedProducts);
            setShowDashboard(true);
            setUploadSuccess(true);
            setFile(null);
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          } catch (error) {
            setUploadError('Error processing CSV data. Please check the file format.');
          }
        },
        error: (error: any) => {
          setUploadError(`Error parsing CSV: ${error.message}`);
        }
      });
    };
    reader.onerror = () => {
      setUploadError('Error reading the file');
    };
    reader.readAsText(file);
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-7xl mx-auto">
        {!showDashboard ? (
          <FileUpload
            file={file}
            isUploading={isUploading}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
            onFileSelect={handleFileUpload}
            onDownloadTemplate={downloadTemplate}
            onUpload={handleSubmit}
          />
        ) : (
          <>
            <button
              onClick={() => setShowDashboard(false)}
              className="mb-6 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Upload
            </button>
            <Dashboard products={products} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
