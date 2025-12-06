// pages/admin/AdminOrders.jsx
import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AdminOrders = () => {
  const [orders, setOrders] = useState([
    { id: 'ORD-001', customer: 'John Doe', date: '2024-01-15', total: 89.97, status: 'Delivered', items: 3 },
    { id: 'ORD-002', customer: 'Jane Smith', date: '2024-01-14', total: 129.50, status: 'Processing', items: 5 },
    { id: 'ORD-003', customer: 'Mike Johnson', date: '2024-01-14', total: 45.99, status: 'Shipped', items: 2 },
    { id: 'ORD-004', customer: 'Sarah Williams', date: '2024-01-13', total: 199.99, status: 'Pending', items: 4 },
    { id: 'ORD-005', customer: 'Robert Brown', date: '2024-01-12', total: 67.50, status: 'Cancelled', items: 3 },
    { id: 'ORD-006', customer: 'Lisa Taylor', date: '2024-01-11', total: 234.00, status: 'Delivered', items: 6 },
    { id: 'ORD-007', customer: 'David Miller', date: '2024-01-10', total: 89.99, status: 'Processing', items: 2 },
    { id: 'ORD-008', customer: 'Emma Davis', date: '2024-01-09', total: 156.75, status: 'Shipped', items: 5 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = ['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Processing': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'Shipped': return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'Cancelled': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Total Revenue: <span className="text-green-600">$1,023.69</span></span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status) => (
          <div key={status} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{status}</p>
                <p className="text-2xl font-bold mt-1">
                  {orders.filter(o => o.status === status).length}
                </p>
              </div>
              {getStatusIcon(status)}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All Status' : option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">{order.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      {order.items} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                      >
                        {statusOptions.filter(o => o !== 'all').map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                        title="Mark as Shipped"
                        onClick={() => updateOrderStatus(order.id, 'Shipped')}
                      >
                        <TruckIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Cancel Order"
                        onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Orders: <span className="font-bold">{filteredOrders.length}</span>
            </div>
            <div className="text-sm font-bold text-gray-800">
              Total Value: ${filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;