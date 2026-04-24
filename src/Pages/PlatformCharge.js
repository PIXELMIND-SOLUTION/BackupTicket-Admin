import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, Save, X, RefreshCw, DollarSign,
  AlertCircle, CheckCircle, Info
} from 'lucide-react';

const PlatformCharge = () => {
  // States
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [newCharge, setNewCharge] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editCharge, setEditCharge] = useState('');
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // API base URL
  const API_BASE_URL = 'http://31.97.206.144:8127/api/admin';

  // Show alert function
  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Fetch all platform charges
  const fetchCharges = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/allplatformcharge`);
      
      if (response.data.success) {
        setCharges(response.data.platformCharges || []);
      } else {
        setError('Failed to fetch platform charges');
      }
    } catch (err) {
      console.error('Error fetching charges:', err);
      setError(err.response?.data?.message || 'Failed to fetch platform charges');
    } finally {
      setLoading(false);
    }
  };

  // Create new platform charge
  const handleCreateCharge = async () => {
    if (!newCharge || isNaN(newCharge) || Number(newCharge) <= 0) {
      showAlertMessage('Please enter a valid positive number for platform charge', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/createplatformcharge`, {
        platformCharge: Number(newCharge)
      });

      if (response.data.success) {
        showAlertMessage('Platform charge created successfully!');
        setNewCharge('');
        fetchCharges();
      }
    } catch (err) {
      console.error('Error creating charge:', err);
      showAlertMessage(err.response?.data?.message || 'Failed to create platform charge', 'error');
    }
  };

  // Start editing a charge
  const startEditing = (charge) => {
    setEditingId(charge._id);
    setEditCharge(charge.platformCharge);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditCharge('');
  };

  // Update platform charge
  const handleUpdateCharge = async (id) => {
    if (!editCharge || isNaN(editCharge) || Number(editCharge) <= 0) {
      showAlertMessage('Please enter a valid positive number', 'error');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/updateplatformcharge/${id}`, {
        platformCharge: Number(editCharge)
      });

      if (response.data.success) {
        showAlertMessage('Platform charge updated successfully!');
        setEditingId(null);
        setEditCharge('');
        fetchCharges();
      }
    } catch (err) {
      console.error('Error updating charge:', err);
      showAlertMessage(err.response?.data?.message || 'Failed to update platform charge', 'error');
    }
  };

  // Delete platform charge
  const handleDeleteCharge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this platform charge?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/deleteplatformcharge/${id}`);

      if (response.data.success) {
        showAlertMessage('Platform charge deleted successfully!');
        fetchCharges();
      }
    } catch (err) {
      console.error('Error deleting charge:', err);
      showAlertMessage(err.response?.data?.message || 'Failed to delete platform charge', 'error');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchCharges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Alert Notification */}
      {showAlert && (
        <div className={`fixed top-4 right-4 z-50 ${alertType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 shadow-lg max-w-md animate-slide-in`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {alertType === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${alertType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {alertMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Charge Management</h1>
          <p className="text-gray-600 mt-2">Manage platform charges for ticket bookings</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900">About Platform Charge</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Platform charge is a fixed amount added to every ticket booking. This helps cover platform maintenance and service costs.
                  </p>
                </div>
              </div>
            </div>

            {/* Add New Charge Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Charge</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="newCharge" className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Charge Amount (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="newCharge"
                      value={newCharge}
                      onChange={(e) => setNewCharge(e.target.value)}
                      placeholder="Enter amount"
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the amount to be added to each ticket booking
                  </p>
                </div>
                
                <button
                  onClick={handleCreateCharge}
                  disabled={!newCharge || loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Platform Charge</span>
                </button>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-900">Important Notes</h3>
                  <ul className="mt-2 text-yellow-800 text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      <span>Only one active platform charge should be maintained</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      <span>Changes take effect immediately for new bookings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      <span>Existing bookings are not affected by updates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      <span>Consider deleting old charges when adding new ones</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Platform Charges</h2>
                  <p className="text-sm text-gray-500 mt-1">List of all platform charges</p>
                </div>
                <button
                  onClick={fetchCharges}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading platform charges...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="mt-4 text-gray-600">{error}</p>
                  <button
                    onClick={fetchCharges}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : charges.length === 0 ? (
                <div className="py-12 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">No platform charges found</p>
                  <p className="text-gray-500 text-sm mt-2">Add your first platform charge using the form on the left</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Charge Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {charges.map((charge) => (
                        <tr key={charge._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingId === charge._id ? (
                              <div className="flex items-center space-x-2">
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="number"
                                    value={editCharge}
                                    onChange={(e) => setEditCharge(e.target.value)}
                                    className="pl-9 block w-40 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                    min="0"
                                    step="0.01"
                                    autoFocus
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    ₹{charge.platformCharge}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {charge._id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(charge.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(charge.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(charge.updatedAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(charge.updatedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {editingId === charge._id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateCharge(charge._id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                                    title="Save Changes"
                                  >
                                    <Save className="h-4 w-4" />
                                    <span className="text-sm">Save</span>
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="text-sm">Cancel</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditing(charge)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                                    title="Edit Charge"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="text-sm">Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCharge(charge._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
                                    title="Delete Charge"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="text-sm">Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary Footer */}
              {charges.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <div>
                      <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{charges.length}</span> platform charge{charges.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {charges.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-700">
                            Current active charge: <span className="text-green-600">₹{charges[0]?.platformCharge}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCharge;