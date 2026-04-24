import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaSearch, FaMoneyBill, FaUser, FaCreditCard, FaBuilding, FaCalendar, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaCheck, FaBan, FaRupeeSign, FaWallet, FaIdCard, FaUniversity, FaCode } from "react-icons/fa";
import axios from "axios";

const RedemptionManagement = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editStatus, setEditStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const redemptionsPerPage = 8;

  const API_BASE_URL = "http://31.97.206.144:8127/api/admin";

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/redemption-requests`);
      
      if (response.data && response.data.success) {
        setRedemptions(response.data.redemptionRequests || []);
      }
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      setError("Failed to fetch redemption requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRedemption || !editStatus) {
      setError("Please select a status");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await axios.put(
        `${API_BASE_URL}/redemption-requestsstatus/${selectedRedemption._id}`,
        { status: editStatus }
      );

      if (response.data && response.data.success) {
        setSuccess(response.data.message);
        
        // Update the redemption in the list
        setRedemptions(redemptions.map(redemption => 
          redemption._id === selectedRedemption._id 
            ? response.data.redemptionRequest 
            : redemption
        ));
        
        setIsEditModalOpen(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (redemptionId) => {
    if (!window.confirm("Are you sure you want to delete this redemption request? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(redemptionId);
      setError("");
      
      const response = await axios.delete(`${API_BASE_URL}/deleteredemption-requests/${redemptionId}`);
      
      if (response.data && response.data.success) {
        setSuccess("Redemption request deleted successfully!");
        setRedemptions(redemptions.filter(redemption => redemption._id !== redemptionId));
        
        // Close modals if open for the deleted redemption
        if (selectedRedemption && selectedRedemption._id === redemptionId) {
          setIsViewModalOpen(false);
          setIsEditModalOpen(false);
        }
        
        // If we're on a page that might now be empty, go back a page
        if (currentRedemptions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting redemption:", error);
      setError(error.response?.data?.message || "Failed to delete redemption request");
    } finally {
      setDeletingId(null);
    }
  };

  const openViewModal = (redemption) => {
    setSelectedRedemption(redemption);
    setIsViewModalOpen(true);
    setError("");
  };

  const openEditModal = (redemption) => {
    setSelectedRedemption(redemption);
    setEditStatus(redemption.status);
    setIsEditModalOpen(true);
    setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            <FaHourglassHalf /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            <FaCheckCircle /> Approved
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            <FaCheck /> Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            <FaBan /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
            Unknown
          </span>
        );
    }
  };

  const getAmountColor = (amount) => {
    if (amount >= 5000) return "text-red-600";
    if (amount >= 2000) return "text-orange-600";
    return "text-green-600";
  };

  // Render account details in table
  const renderAccountDetails = (redemption) => {
    if (redemption.accountDetails) {
      const { accountHolderName, bankName, accountNumber, ifscCode } = redemption.accountDetails;
      return (
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <FaIdCard className="text-gray-400 mr-1" />
            <span className="text-gray-700">{accountHolderName}</span>
          </div>
          <div className="flex items-center text-xs">
            <FaBuilding className="text-gray-400 mr-1" />
            <span className="text-gray-600">{bankName}</span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Acc: {accountNumber?.substring(0, 6)}...
          </div>
        </div>
      );
    }
    return (
      <div className="text-xs text-gray-400 italic">No account details</div>
    );
  };

  // Filter redemptions based on search
  const filteredRedemptions = redemptions.filter((redemption) => {
    const matchesSearch = 
      (redemption.userId?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.userId?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.userId?.phoneNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption._id || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.upiId || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.accountDetails?.accountHolderName || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.accountDetails?.bankName || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.accountDetails?.accountNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (redemption.accountDetails?.ifscCode || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || redemption.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastRedemption = currentPage * redemptionsPerPage;
  const indexOfFirstRedemption = indexOfLastRedemption - redemptionsPerPage;
  const currentRedemptions = filteredRedemptions.slice(indexOfFirstRedemption, indexOfLastRedemption);
  const totalPages = Math.ceil(filteredRedemptions.length / redemptionsPerPage);

  const calculateTotalAmount = () => {
    return redemptions.reduce((sum, redemption) => sum + (redemption.amount || 0), 0);
  };

  const calculatePendingAmount = () => {
    return redemptions
      .filter(r => r.status === 'pending')
      .reduce((sum, redemption) => sum + (redemption.amount || 0), 0);
  };

  const calculateCompletedAmount = () => {
    return redemptions
      .filter(r => r.status === 'completed')
      .reduce((sum, redemption) => sum + (redemption.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading redemption requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Redemption Management</h1>
        <p className="text-gray-600">Manage user redemption requests and payments</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FaWallet className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{redemptions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <FaMoneyBill className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{calculateTotalAmount()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <FaHourglassHalf className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{calculatePendingAmount()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FaCheck className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{calculateCompletedAmount()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, UPI ID, bank details, account number, or redemption ID..."
                className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Redemptions Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User Details
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount & Method
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bank/Account Details
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRedemptions.map((redemption) => (
                <tr key={redemption._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FaUser className="text-blue-500 mr-2" />
                        <div className="text-sm font-semibold text-gray-900">
                          {redemption.userId?.fullName || "N/A"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {redemption.userId?.email || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        📱 {redemption.userId?.phoneNumber || "N/A"}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className={`text-xl font-bold ${getAmountColor(redemption.amount)} flex items-center gap-2`}>
                        <FaRupeeSign /> {redemption.amount || 0}
                      </div>
                      <div className="text-xs">
                        {redemption.upiId ? (
                          <span className="flex items-center gap-1 text-gray-600">
                            <FaCreditCard /> UPI: {redemption.upiId}
                          </span>
                        ) : redemption.accountDetails ? (
                          <span className="flex items-center gap-1 text-gray-600">
                            <FaBuilding /> Bank Transfer
                          </span>
                        ) : (
                          <span className="text-gray-400">Payment method not specified</span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    {renderAccountDetails(redemption)}
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div>
                        {getStatusBadge(redemption.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {redemption._id?.substring(0, 12)}...
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {formatDate(redemption.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {formatDate(redemption.updatedAt)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(redemption)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 hover:border-blue-300"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(redemption)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition border border-green-200 hover:border-green-300"
                        title="Edit Status"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(redemption._id)}
                        disabled={deletingId === redemption._id}
                        className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200 hover:border-red-300 ${
                          deletingId === redemption._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete Request"
                      >
                        {deletingId === redemption._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {currentRedemptions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaWallet className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No redemption requests found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRedemptions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{indexOfFirstRedemption + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(indexOfLastRedemption, filteredRedemptions.length)}</span> of{" "}
            <span className="font-semibold">{filteredRedemptions.length}</span> requests
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 rounded-lg transition ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Redemption Details Modal */}
      {isViewModalOpen && selectedRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaWallet className="mr-2 text-blue-500" />
                    Redemption Request Details
                  </h2>
                  <p className="text-gray-600">Complete information about the redemption request</p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Request Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FaWallet className="mr-2" /> Request Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Redemption ID</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {selectedRedemption._id}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Request Amount</p>
                      <p className={`text-2xl font-bold ${getAmountColor(selectedRedemption.amount)}`}>
                        ₹{selectedRedemption.amount}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Request Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(selectedRedemption.createdAt)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedRedemption.status)}</div>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FaUser className="mr-2" /> User Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRedemption.userId?.fullName}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRedemption.userId?.email}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRedemption.userId?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FaCreditCard className="mr-2" /> Payment Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Amount */}
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Request Amount</p>
                      <p className={`text-3xl font-bold ${getAmountColor(selectedRedemption.amount)}`}>
                        ₹{selectedRedemption.amount}
                      </p>
                    </div>

                    {/* UPI Details - ALWAYS SHOW IF EXISTS */}
                    {selectedRedemption.upiId && (
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          <FaCreditCard className="text-purple-500" /> UPI Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">UPI ID</p>
                            <p className="text-xl font-bold text-gray-900 font-mono">{selectedRedemption.upiId}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold flex items-center justify-center gap-1">
                              <FaCreditCard /> UPI Payment
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank Account Details - ALWAYS SHOW IF EXISTS */}
                    {selectedRedemption.accountDetails && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                            <FaBuilding className="text-green-500" /> Bank Account Details
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Account Holder Name</p>
                              <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaIdCard /> {selectedRedemption.accountDetails.accountHolderName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Bank Name</p>
                              <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaBuilding /> {selectedRedemption.accountDetails.bankName}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Account Number</p>
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <FaCreditCard className="text-gray-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 font-mono">
                                  {selectedRedemption.accountDetails.accountNumber}
                                </p>
                                <p className="text-xs text-gray-500">Account Number</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">IFSC Code</p>
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <FaCode className="text-gray-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 font-mono">
                                  {selectedRedemption.accountDetails.ifscCode}
                                </p>
                                <p className="text-xs text-gray-500">IFSC Code</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If no payment method specified */}
                    {!selectedRedemption.upiId && !selectedRedemption.accountDetails && (
                      <div className="bg-white p-4 rounded-lg text-center">
                        <p className="text-gray-500">No payment method specified</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FaCheckCircle className="mr-2" /> Status Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Current Status</p>
                      <div className="mt-2">{getStatusBadge(selectedRedemption.status)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedRedemption.createdAt)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedRedemption.updatedAt)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Redemption ID</p>
                      <p className="font-medium text-gray-900 font-mono text-sm">
                        {selectedRedemption._id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedRedemption);
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit Status
                </button>
                <button
                  onClick={() => handleDelete(selectedRedemption._id)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <FaTrash /> Delete Request
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Edit Status Modal - Just Dropdown */}
      {isEditModalOpen && selectedRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  ✕
                </button>
              </div>

              {/* User Info - Compact */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 text-sm">{selectedRedemption.userId?.fullName}</p>
                <p className="text-xs text-gray-600">{selectedRedemption.userId?.email}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">₹{selectedRedemption.amount}</p>
              </div>

              {/* Current Status */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="flex justify-start">{getStatusBadge(selectedRedemption.status)}</div>
              </div>

              {/* Status Dropdown */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Select New Status</p>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || !editStatus}
                  className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    updating || !editStatus
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Update
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedemptionManagement;