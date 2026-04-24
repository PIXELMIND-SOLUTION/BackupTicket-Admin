import { useState, useEffect } from "react";
import { FaEye, FaTrash, FaSearch, FaTicketAlt, FaCalendar, FaMoneyBill, FaUser, FaCheckCircle, FaTimesCircle, FaFilm, FaShoppingCart, FaCreditCard, FaChair, FaReceipt, FaRupeeSign, FaTag, FaChartBar } from "react-icons/fa";
import axios from "axios";

const MovieBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const bookingsPerPage = 8;

  const API_BASE_URL = "http://31.97.206.144:8127/api/admin";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/alluserspurchedmoviestickets`);
      
      if (response.data && response.data.success) {
        setBookings(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!orderId) {
      alert("Invalid order ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleteLoading(true);
      
      const response = await axios.delete(`${API_BASE_URL}/deletemovie-tickets/${orderId}`);
      
      if (response.data && response.data.success) {
        setBookings(bookings.filter((booking) => booking.orderId !== orderId));
        
        if (selectedBooking && selectedBooking.orderId === orderId) {
          setIsViewModalOpen(false);
        }
        
        alert("Booking deleted successfully!");
        
        if (currentBookings.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        throw new Error(response.data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      
      if (error.response) {
        if (error.response.status === 404) {
          alert("Booking not found. It may have already been deleted.");
          fetchBookings();
        } else if (error.response.status === 403) {
          alert("You don't have permission to delete this booking.");
        } else {
          alert(`Failed to delete booking: ${error.response.data.message || "Server error"}`);
        }
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const openViewModal = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getPaymentStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaCheckCircle /> Paid</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">Pending</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaTimesCircle /> Failed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">Unknown</span>;
    }
  };

  const getOrderStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Completed</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Processing</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  // Calculate platform charge and GST for a booking
  const calculatePlatformCharge = (booking) => {
    if (!booking.tickets || booking.tickets.length === 0) return 0;
    
    return booking.tickets.reduce((sum, ticket) => {
      return sum + (ticket.ticket?.platformCharge || 0);
    }, 0);
  };

  const calculateGST = (booking) => {
    if (!booking.tickets || booking.tickets.length === 0) return 0;
    
    return booking.tickets.reduce((sum, ticket) => {
      return sum + (ticket.ticket?.gst || 0);
    }, 0);
  };

  // Calculate base price (without charges)
  const calculateBasePrice = (booking) => {
    if (!booking.tickets || booking.tickets.length === 0) return 0;
    
    return booking.tickets.reduce((sum, ticket) => {
      return sum + (ticket.ticket?.totalPrice || 0);
    }, 0);
  };

  // Filter bookings based on search
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      (booking.user?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (booking.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (booking.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
      (booking.transactionId || "").toLowerCase().includes(search.toLowerCase()) ||
      (booking.tickets?.[0]?.ticket?.MovieName || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const calculateTotalRevenue = () => {
    return bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  };

  const calculateTotalTickets = () => {
    return bookings.reduce((sum, booking) => {
      return sum + (booking.tickets?.reduce((ticketSum, ticket) => 
        ticketSum + (ticket.ticket?.quantity || 0), 0) || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Movie Bookings</h1>
        <p className="text-gray-600">Manage all movie bookings and payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FaShoppingCart className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FaMoneyBill className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{calculateTotalRevenue()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <FaTicketAlt className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateTotalTickets()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg mr-4">
              <FaCheckCircle className="text-amber-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.paymentStatus === 'paid').length}
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
                placeholder="Search by user name, email, order ID, transaction ID, or movie name..."
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order & User
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Movie Details
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount Details
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBookings.map((booking) => {
                const platformCharge = calculatePlatformCharge(booking);
                const gst = calculateGST(booking);
                const basePrice = calculateBasePrice(booking);
                
                return (
                  <tr key={booking.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FaShoppingCart className="text-blue-500 mr-2" />
                          <div className="text-sm font-semibold text-gray-900">
                            Order: {booking.orderId?.substring(0, 12)}...
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <FaUser className="text-gray-400 mr-2" />
                          <span className="text-gray-600">{booking.user?.fullName || "N/A"}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.user?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      {booking.tickets?.[0]?.ticket && (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FaFilm className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {booking.tickets[0].ticket.MovieName || "N/A"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {booking.tickets[0].ticket.theatrePlace || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.tickets[0].ticket.quantity || 0} ticket(s)
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-green-600">
                          ₹{booking.totalAmount || 0}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Base Price:</span>
                            <span className="font-medium">₹{basePrice}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 flex items-center">
                              <FaRupeeSign className="mr-1" /> Platform Charge:
                            </span>
                            <span className="text-blue-600 font-medium">₹{platformCharge}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 flex items-center">
                              <FaRupeeSign className="mr-1" /> GST:
                            </span>
                            <span className="text-purple-600 font-medium">₹{gst}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        <div>
                          {getOrderStatusBadge(booking.orderStatus)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Razorpay: {booking.razorpayStatus || "N/A"}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatDate(booking.createdAt)}
                        </div>
                        <div className="text-gray-500">
                          {new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 hover:border-blue-300"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.orderId)}
                          disabled={deleteLoading}
                          className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200 hover:border-red-300 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Delete Booking"
                        >
                          {deleteLoading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {currentBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No bookings found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{indexOfFirstBooking + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(indexOfLastBooking, filteredBookings.length)}</span> of{" "}
            <span className="font-semibold">{filteredBookings.length}</span> bookings
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Booking Details Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaShoppingCart className="mr-2 text-blue-500" />
                    Booking Details
                  </h2>
                  <p className="text-gray-600">Complete information about the movie booking</p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FaShoppingCart className="mr-2" /> Order Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {selectedBooking.orderId}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {selectedBooking.transactionId}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(selectedBooking.createdAt)}
                      </p>
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
                      <p className="text-lg font-semibold text-gray-900">{selectedBooking.user?.fullName}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedBooking.user?.email}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedBooking.user?.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information with Platform Charge and GST */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FaChartBar className="mr-2" /> Payment Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Charges Breakdown */}
                    <div className="bg-white p-5 rounded-lg space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-3">Amount Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Base Ticket Price:</span>
                          <span className="font-medium">₹{calculateBasePrice(selectedBooking)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center">
                            <FaRupeeSign className="mr-1" /> Platform Charge:
                          </span>
                          <span className="font-medium text-blue-600">₹{calculatePlatformCharge(selectedBooking)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center">
                            <FaRupeeSign className="mr-1" /> GST (18%):
                          </span>
                          <span className="font-medium text-purple-600">₹{calculateGST(selectedBooking)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold text-gray-900">Total Amount:</span>
                          <span className="text-2xl font-bold text-green-600">₹{selectedBooking.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white p-5 rounded-lg space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Status</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <div className="mt-2">{getPaymentStatusBadge(selectedBooking.paymentStatus)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Order Status</p>
                          <div className="mt-2">{getOrderStatusBadge(selectedBooking.orderStatus)}</div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Razorpay Status</p>
                          <p className="font-semibold text-gray-900 capitalize mt-1">
                            {selectedBooking.razorpayStatus || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movie Tickets */}
                {selectedBooking.tickets?.map((ticketItem, index) => {
                  const platformCharge = ticketItem.ticket?.platformCharge || 0;
                  const gst = ticketItem.ticket?.gst || 0;
                  const basePrice = ticketItem.ticket?.totalPrice || 0;
                  const totalAmount = ticketItem.ticket?.totalAmountWithCharges || 0;
                  
                  return (
                    <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaTicketAlt className="mr-2" /> Ticket #{index + 1} - {ticketItem.ticket?.MovieName}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Movie Details */}
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Movie Name</p>
                            <p className="text-lg font-semibold text-gray-900">{ticketItem.ticket?.MovieName}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Show Date</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(ticketItem.ticket?.showDate)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Show Time</p>
                              <p className="font-medium text-gray-900">
                                {formatTime(ticketItem.ticket?.showTime)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Theatre & Language</p>
                            <p className="font-medium text-gray-900">
                              {ticketItem.ticket?.theatrePlace} • {ticketItem.ticket?.language}
                            </p>
                          </div>
                        </div>

                        {/* Ticket Pricing Details */}
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Pricing Details</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Price per ticket:</span>
                                <span className="font-medium">₹{ticketItem.ticket?.pricePerTicket}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-bold text-blue-600">{ticketItem.ticket?.quantity}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Base Total:</span>
                                <span className="font-medium">₹{basePrice}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center">
                                  <FaRupeeSign className="mr-1" /> Platform Charge:
                                </span>
                                <span className="font-medium text-blue-600">₹{platformCharge}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center">
                                  <FaRupeeSign className="mr-1" /> GST:
                                </span>
                                <span className="font-medium text-purple-600">₹{gst}</span>
                              </div>
                              <hr className="my-1" />
                              <div className="flex justify-between text-lg">
                                <span className="font-bold text-gray-900">Ticket Total:</span>
                                <span className="font-bold text-green-600">₹{totalAmount}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selected Seats */}
                          {ticketItem.ticket?.selectedSeats && ticketItem.ticket.selectedSeats.length > 0 && (
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-500 mb-2 flex items-center">
                                <FaChair className="mr-2" /> Selected Seats
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {ticketItem.ticket.selectedSeats.map((seat, seatIndex) => (
                                  <span key={seatIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Ticket Info */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Ticket Status</p>
                          <p className="font-medium capitalize">{ticketItem.ticket?.status || "N/A"}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Sold/Remaining</p>
                          <p className="font-medium">
                            {ticketItem.ticket?.soldCount || 0} / {ticketItem.ticket?.remainingCount || 0}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-gray-500">QR Code</p>
                          <p className="font-medium text-blue-600 truncate">{ticketItem.ticket?.qrCodeLink || "N/A"}</p>
                        </div>
                      </div>

                      {/* Ticket Category */}
                      <div className="mt-4 bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">Ticket Category</p>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {ticketItem.ticket?.ticketCategory}
                        </span>
                      </div>

                      {/* Ticket Image */}
                      {ticketItem.ticket?.ticketImage && (
                        <div className="mt-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Ticket Image</p>
                            <div className="flex justify-center">
                              <img 
                                src={`http://31.97.206.144:8127${ticketItem.ticket.ticketImage}`}
                                alt="Ticket"
                                className="max-h-48 rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Report Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Reported Status</p>
                      <p className={`font-semibold ${selectedBooking.isReported ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedBooking.isReported ? 'Reported' : 'Not Reported'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedBooking.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Delete Button */}
              <div className="mt-6 pt-4 border-t flex gap-3">
                <button
                  onClick={() => handleDelete(selectedBooking.orderId)}
                  disabled={deleteLoading}
                  className={`flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Delete Booking
                    </>
                  )}
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
    </div>
  );
};

export default MovieBookings;