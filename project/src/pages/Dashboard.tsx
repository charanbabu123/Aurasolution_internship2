import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Upload, LogOut } from 'lucide-react';
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

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const profitData = products
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const categoryData = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ category: product.category, value: 1 });
    }
    return acc;
  }, []);

  const lowStockProducts = products
    .filter(product => product.stockQuantity < 10)
    .sort((a, b) => a.stockQuantity - b.stockQuantity);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Inventory Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/upload"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                Upload Data
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Profitable Products */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Top Profitable Products</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="profit" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Low Stock Alert</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <tr key={product.sku}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;