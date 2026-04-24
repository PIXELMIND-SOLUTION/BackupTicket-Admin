import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaSearch, FaTicketAlt, FaCalendar, FaMoneyBill, FaFilm, FaTheaterMasks, FaLanguage, FaUser, FaCheckCircle, FaTimesCircle, FaImage, FaQrcode, FaChair, FaBuilding, FaClock, FaTag, FaIdBadge, FaCompress, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://31.97.206.144:8127";

const UserMovies = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [imageErrors, setImageErrors] = useState({});
  const moviesPerPage = 8;

  // Edit form state
  const [editForm, setEditForm] = useState({
    ticketImage: null,
    qrCode: null,
    ticketImagePreview: "",
    qrCodePreview: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    MovieName: "",
    language: "",
    theatrePlace: "",
    showDate: "",
    showTime: "",
    ticketCategory: "",
    noOfTickets: "",
    pricePerTicket: "",
    totalPrice: "",
    qrCodeLink: "",
    ticketType: "",
    screen: "",
    termsAndConditionsAccepted: false,
    status: "",
    selectedSeats: ""
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/allusersmovies`);
      
      if (response.data && response.data.success) {
        setMovies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      alert("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this movie ticket?")) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/admin/deletemovieticet/${ticketId}`);
        
        if (response.data.success) {
          alert(response.data.message || "Movie ticket deleted successfully");
          setMovies(movies.filter((movie) => movie._id !== ticketId));
          if (selectedMovie?._id === ticketId) {
            setIsViewModalOpen(false);
            setSelectedMovie(null);
          }
        } else {
          alert(response.data.message || "Failed to delete movie ticket");
        }
      } catch (error) {
        console.error("Error deleting movie:", error);
        const errorMsg = error.response?.data?.message || "Failed to delete movie ticket";
        alert(errorMsg);
      }
    }
  };

  const openViewModal = (movie) => {
    setSelectedMovie(movie);
    setIsEditMode(false);
    setIsViewModalOpen(true);
  };

  const openCompareModal = () => {
    setIsCompareModalOpen(true);
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    setEditingMovie(selectedMovie);
    
    // Reset image errors
    setImageErrors({});
    
    // Populate edit form with current movie data
    setEditForm({
      fullName: selectedMovie.fullName || "",
      phoneNumber: selectedMovie.phoneNumber || "",
      email: selectedMovie.email || "",
      MovieName: selectedMovie.MovieName || "",
      language: selectedMovie.language || "",
      theatrePlace: selectedMovie.theatrePlace || "",
      showDate: selectedMovie.showDate ? selectedMovie.showDate.split('T')[0] : "",
      showTime: selectedMovie.showTime || "",
      ticketCategory: selectedMovie.ticketCategory || "",
      noOfTickets: selectedMovie.noOfTickets || "",
      pricePerTicket: selectedMovie.pricePerTicket || "",
      totalPrice: selectedMovie.totalPrice || "",
      qrCodeLink: selectedMovie.qrCodeLink || "",
      ticketType: selectedMovie.ticketType || "",
      screen: selectedMovie.screen || "",
      termsAndConditionsAccepted: selectedMovie.termsAndConditionsAccepted || false,
      status: selectedMovie.status || "",
      selectedSeats: selectedMovie.selectedSeats ? JSON.stringify(selectedMovie.selectedSeats) : "[]",
      ticketImage: null,
      qrCode: null,
      ticketImagePreview: getFullImageUrl(selectedMovie.ticketImage) || "",
      qrCodePreview: getFullImageUrl(selectedMovie.qrCode) || ""
    });
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setEditingMovie(null);
    resetEditForm();
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      if (files && files[0]) {
        const file = files[0];
        const previewUrl = URL.createObjectURL(file);
        
        if (name === "ticketImage") {
          setEditForm(prev => ({
            ...prev,
            ticketImage: file,
            ticketImagePreview: previewUrl
          }));
        } else if (name === "qrCode") {
          setEditForm(prev => ({
            ...prev,
            qrCode: file,
            qrCodePreview: previewUrl
          }));
        }
      }
    } else if (type === "checkbox") {
      setEditForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (!editForm.status) {
        alert("Please select a status");
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/api/admin/updatemovieticet/${editingMovie._id}`, {
        status: editForm.status
      });
      
      if (response.data.success) {
        alert(response.data.message || "Movie status updated successfully");
        
        // Update movies list
        const updatedMovies = movies.map(movie => 
          movie._id === editingMovie._id ? {...movie, status: editForm.status} : movie
        );
        setMovies(updatedMovies);
        
        // Update selected movie
        setSelectedMovie({...selectedMovie, status: editForm.status});
        
        // Stay in edit mode but update the form
        setEditForm(prev => ({
          ...prev,
          status: editForm.status
        }));
      } else {
        alert(response.data.message || "Failed to update movie status");
      }
    } catch (error) {
      console.error("Error updating movie:", error);
      const errorMsg = error.response?.data?.message || "Failed to update movie status";
      alert(errorMsg);
    }
  };

  const handleTicketUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(editForm).forEach(key => {
        if (key !== 'ticketImage' && key !== 'qrCode' && key !== 'ticketImagePreview' && key !== 'qrCodePreview') {
          if (key === 'selectedSeats' && editForm[key]) {
            try {
              const seatsArray = JSON.parse(editForm[key]);
              formData.append(key, JSON.stringify(seatsArray));
            } catch (err) {
              formData.append(key, editForm[key]);
            }
          } else {
            formData.append(key, editForm[key]);
          }
        }
      });
      
      // Add files if they exist
      if (editForm.ticketImage) {
        formData.append('ticketImage', editForm.ticketImage);
      }
      
      if (editForm.qrCode) {
        formData.append('qrCode', editForm.qrCode);
      }
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/admin/updatemovie/${editingMovie._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      if (response.data.success) {
        alert(response.data.message || "Movie ticket updated successfully");
        
        // Refresh movies
        await fetchMovies();
        
        // Update selected movie with new data
        const updatedMovie = movies.find(m => m._id === editingMovie._id);
        setSelectedMovie(updatedMovie);
        
        setIsEditMode(false);
        setEditingMovie(null);
        resetEditForm();
      } else {
        alert(response.data.message || "Failed to update movie ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      const errorMsg = error.response?.data?.message || "Failed to update movie ticket";
      alert(errorMsg);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      ticketImage: null,
      qrCode: null,
      ticketImagePreview: "",
      qrCodePreview: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      MovieName: "",
      language: "",
      theatrePlace: "",
      showDate: "",
      showTime: "",
      ticketCategory: "",
      noOfTickets: "",
      pricePerTicket: "",
      totalPrice: "",
      qrCodeLink: "",
      ticketType: "",
      screen: "",
      termsAndConditionsAccepted: false,
      status: "",
      selectedSeats: ""
    });
  };

  const handleImageError = (imageType, id) => {
    setImageErrors(prev => ({
      ...prev,
      [`${imageType}_${id}`]: true
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaCheckCircle /> Active</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">Pending</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaTimesCircle /> Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">Unknown</span>;
    }
  };

  // Filter movies based on search and status
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = 
      (movie.MovieName || "").toLowerCase().includes(search.toLowerCase()) ||
      (movie.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (movie.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (movie.theatrePlace || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || movie.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Uploaded Movies</h1>
        <p className="text-gray-600">Manage all movie tickets uploaded by users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FaTicketAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{movies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {movies.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg mr-4">
              <FaMoneyBill className="text-amber-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{movies.reduce((sum, movie) => sum + (movie.totalPrice || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <FaUser className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(movies.map(m => m.userId?._id))].length}
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
                placeholder="Search by movie name, user, email, or theatre..."
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Movie & User
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Show Details
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tickets & Price
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
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
              {currentMovies.map((movie) => (
                <tr key={movie._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FaFilm className="text-blue-500 mr-2" />
                        <div className="text-sm font-semibold text-gray-900">
                          {movie.MovieName || "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaUser className="text-gray-400 mr-2" />
                        <span className="text-gray-600">{movie.fullName || movie.userId?.fullName || "N/A"}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {movie._id?.substring(0, 10)}...
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaTheaterMasks className="text-gray-400 mr-2" />
                        <span className="text-gray-900">{movie.theatrePlace || "N/A"}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaLanguage className="text-gray-400 mr-2" />
                        <span className="text-gray-600">{movie.language || "N/A"}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaCalendar className="text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {formatDate(movie.showDate)} {movie.showTime ? `at ${movie.showTime}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Tickets: </span>
                        <span className={`font-semibold ${movie.noOfTickets < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {Math.abs(movie.noOfTickets || 0)}
                        </span>
                        {movie.ticketCategory && (
                          <span className="text-gray-600 ml-2">({movie.ticketCategory})</span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Price: </span>
                        <span className="font-bold text-green-600">₹{movie.totalPrice || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{movie.pricePerTicket || 0} per ticket
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    {getStatusBadge(movie.status)}
                    <div className="mt-2 text-xs text-gray-500">
                      Sold: {movie.soldCount || 0}<br/>
                      Remaining: {movie.remainingCount || 0}
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {formatDate(movie.createdAt)}
                      </div>
                      <div className="text-gray-500">
                        {new Date(movie.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(movie)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 hover:border-blue-300"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200 hover:border-red-300"
                        title="Delete Ticket"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {currentMovies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaTicketAlt className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No movie tickets found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredMovies.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{indexOfFirstMovie + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(indexOfLastMovie, filteredMovies.length)}</span> of{" "}
            <span className="font-semibold">{filteredMovies.length}</span> tickets
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

      {/* View/Edit Movie Details Modal - Same UI for both modes */}
      {isViewModalOpen && selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaTicketAlt className="mr-2 text-blue-500" />
                    {isEditMode ? "Edit Ticket Details" : "Ticket Details"}
                  </h2>
                  <p className="text-gray-600">
                    {isEditMode ? "Modify the ticket information below" : "Complete information about the movie ticket"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditMode ? (
                    <>
                      <button
                        onClick={enableEditMode}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition border border-green-200 hover:border-green-300"
                        title="Edit Ticket"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedMovie._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200 hover:border-red-300"
                        title="Delete Ticket"
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleTicketUpdate}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 hover:border-blue-300"
                        title="Save All Changes"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={cancelEditMode}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                        title="Cancel Edit"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setIsEditMode(false);
                      setSelectedMovie(null);
                      cancelEditMode();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Same UI Layout for both View and Edit modes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Images Section */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Movie Image */}
                  {selectedMovie.movieId?.image && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaFilm className="mr-2 text-blue-600" /> Movie Poster
                      </h3>
                      <div className="flex justify-center">
                        <img 
                          src={getFullImageUrl(selectedMovie.movieId.image)}
                          alt={selectedMovie.MovieName}
                          className="w-full h-64 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300x200?text=Movie+Poster+Not+Found";
                          }}
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-medium text-gray-900">{selectedMovie.MovieName}</p>
                        <p className="text-xs text-gray-500 mt-1">Movie Poster</p>
                      </div>
                    </div>
                  )}

                  {/* Ticket Image */}
                  {selectedMovie.ticketImage && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaTicketAlt className="mr-2 text-green-600" /> Ticket Image
                      </h3>
                      <div className="flex justify-center">
                        <img 
                          src={getFullImageUrl(selectedMovie.ticketImage)}
                          alt="Movie Ticket"
                          className="w-full h-64 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-medium text-gray-900">Uploaded Ticket</p>
                        <p className="text-xs text-gray-500 mt-1">Ticket Image</p>
                      </div>
                    </div>
                  )}

                  {/* QR Code */}
                  {selectedMovie.qrCode && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaQrcode className="mr-2 text-purple-600" /> QR Code
                      </h3>
                      <div className="flex flex-col items-center">
                        <img 
                          src={getFullImageUrl(selectedMovie.qrCode)}
                          alt="QR Code"
                          className="w-48 h-48 object-contain rounded-lg shadow-lg bg-white p-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                        {selectedMovie.qrCodeLink && (
                          <div className="mt-3 bg-white p-3 rounded-lg w-full">
                            <p className="text-sm font-medium text-gray-700 mb-1">QR Code Link:</p>
                            <p className="text-xs font-mono text-blue-600 break-all bg-gray-50 p-2 rounded">
                              {selectedMovie.qrCodeLink}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Details Section */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Movie & User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <FaFilm className="mr-2" /> Movie Information
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaTag className="mr-2" /> Movie Name
                            </p>
                            {isEditMode ? (
                              <input
                                type="text"
                                name="MovieName"
                                value={editForm.MovieName}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="text-lg font-semibold text-gray-900">{selectedMovie.MovieName}</p>
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaLanguage className="mr-2" /> Language
                            </p>
                            {isEditMode ? (
                              <input
                                type="text"
                                name="language"
                                value={editForm.language}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{selectedMovie.language || "N/A"}</p>
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaIdBadge className="mr-2" /> Ticket Category
                            </p>
                            {isEditMode ? (
                              <input
                                type="text"
                                name="ticketCategory"
                                value={editForm.ticketCategory}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{selectedMovie.ticketCategory || "N/A"}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <FaUser className="mr-2" /> User Information
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaUser className="mr-2" /> Full Name
                            </p>
                            {isEditMode ? (
                              <input
                                type="text"
                                name="fullName"
                                value={editForm.fullName}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="text-lg font-semibold text-gray-900">{selectedMovie.fullName || selectedMovie.userId?.fullName || "N/A"}</p>
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaIdBadge className="mr-2" /> Email
                            </p>
                            {isEditMode ? (
                              <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{selectedMovie.email || selectedMovie.userId?.email || "N/A"}</p>
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaIdBadge className="mr-2" /> Phone Number
                            </p>
                            {isEditMode ? (
                              <input
                                type="text"
                                name="phoneNumber"
                                value={editForm.phoneNumber}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{selectedMovie.phoneNumber || selectedMovie.userId?.phoneNumber || "N/A"}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show Details */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaTheaterMasks className="mr-2" /> Show Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaBuilding className="mr-2" /> Theatre Place
                          </p>
                          {isEditMode ? (
                            <input
                              type="text"
                              name="theatrePlace"
                              value={editForm.theatrePlace}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">{selectedMovie.theatrePlace || "N/A"}</p>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaCalendar className="mr-2" /> Show Date
                          </p>
                          {isEditMode ? (
                            <input
                              type="date"
                              name="showDate"
                              value={editForm.showDate}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDate(selectedMovie.showDate)}
                            </p>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaClock className="mr-2" /> Show Time
                          </p>
                          {isEditMode ? (
                            <input
                              type="text"
                              name="showTime"
                              value={editForm.showTime}
                              onChange={handleEditFormChange}
                              placeholder="HH:MM"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {formatTime(selectedMovie.showTime)}
                            </p>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaFilm className="mr-2" /> Screen
                          </p>
                          {isEditMode ? (
                            <input
                              type="text"
                              name="screen"
                              value={editForm.screen}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedMovie.screen || "N/A"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seats Information */}
                    {(selectedMovie.selectedSeats && selectedMovie.selectedSeats.length > 0) && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <FaChair className="mr-2" /> Seats Information
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Selected Seats ({selectedMovie.selectedSeats.length})</p>
                            {isEditMode ? (
                              <textarea
                                name="selectedSeats"
                                value={editForm.selectedSeats}
                                onChange={handleEditFormChange}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder='["Row C, Seat 7", "Row C, Seat 8", "Row C, Seat 9"]'
                              />
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {selectedMovie.selectedSeats.map((seat, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {selectedMovie.purchasedSeats && selectedMovie.purchasedSeats.length > 0 && (
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-500 mb-2">Purchased Seats ({selectedMovie.purchasedSeats.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedMovie.purchasedSeats.map((seat, index) => (
                                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ticket & Price Details */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaMoneyBill className="mr-2" /> Ticket & Pricing
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Number of Tickets</p>
                          {isEditMode ? (
                            <input
                              type="number"
                              name="noOfTickets"
                              value={editForm.noOfTickets}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className={`text-2xl font-bold ${selectedMovie.noOfTickets < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {Math.abs(selectedMovie.noOfTickets || 0)}
                            </p>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Price Per Ticket</p>
                          {isEditMode ? (
                            <input
                              type="number"
                              name="pricePerTicket"
                              value={editForm.pricePerTicket}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="text-2xl font-bold text-gray-900">₹{selectedMovie.pricePerTicket || 0}</p>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Total Price</p>
                          {isEditMode ? (
                            <input
                              type="number"
                              name="totalPrice"
                              value={editForm.totalPrice}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="text-2xl font-bold text-green-600">₹{selectedMovie.totalPrice || 0}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Status Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Current Status</p>
                          {isEditMode ? (
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              required
                            >
                              <option value="">Select Status</option>
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <div className="mt-2">{getStatusBadge(selectedMovie.status)}</div>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Sold Count</p>
                          <p className="text-xl font-bold text-gray-900">{selectedMovie.soldCount || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Remaining Count</p>
                          <p className="text-xl font-bold text-gray-900">{selectedMovie.remainingCount || 0}</p>
                        </div>
                      </div>
                      {isEditMode && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="termsAndConditionsAccepted"
                              name="termsAndConditionsAccepted"
                              checked={editForm.termsAndConditionsAccepted}
                              onChange={handleEditFormChange}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="termsAndConditionsAccepted" className="ml-2 text-sm text-gray-700">
                              Terms and Conditions Accepted
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={handleStatusUpdate}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center gap-2"
                          >
                            <FaCheckCircle /> Update Status Only
                          </button>
                        </div>
                      )}
                      {!isEditMode && selectedMovie.termsAndConditionsAccepted && (
                        <div className="mt-4 bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800 flex items-center">
                            <FaCheckCircle className="mr-2" /> Terms and Conditions Accepted
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Ticket Type</p>
                          {isEditMode ? (
                            <input
                              type="text"
                              name="ticketType"
                              value={editForm.ticketType}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="font-medium text-gray-900">{selectedMovie.ticketType || "N/A"}</p>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">QR Code Link</p>
                          {isEditMode ? (
                            <input
                              type="text"
                              name="qrCodeLink"
                              value={editForm.qrCodeLink}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          ) : (
                            <p className="font-mono text-sm text-blue-600 break-all">{selectedMovie.qrCodeLink || "N/A"}</p>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Ticket ID</p>
                          <p className="font-mono text-sm text-gray-700">{selectedMovie._id}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Created At</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(selectedMovie.createdAt)} at {new Date(selectedMovie.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(selectedMovie.updatedAt)} at {new Date(selectedMovie.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* File Uploads - Only show in Edit Mode */}
                    {isEditMode && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">File Uploads</h3>
                          <button
                            type="button"
                            onClick={openCompareModal}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                          >
                            <FaCompress /> Compare Preview
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Ticket Image */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ticket Image
                            </label>
                            <input
                              type="file"
                              name="ticketImage"
                              onChange={handleEditFormChange}
                              accept="image/*"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {editForm.ticketImagePreview && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-2">Current Preview:</p>
                                <div className="border rounded-lg p-2 bg-gray-50">
                                  <img 
                                    src={editForm.ticketImagePreview} 
                                    alt="Ticket Preview" 
                                    className="max-h-40 mx-auto object-contain rounded"
                                    onError={() => handleImageError('ticket', editingMovie._id)}
                                  />
                                </div>
                              </div>
                            )}
                            {!editForm.ticketImagePreview && (
                              <p className="mt-2 text-sm text-gray-500 italic">No ticket image available</p>
                            )}
                          </div>

                          {/* QR Code */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              QR Code Image
                            </label>
                            <input
                              type="file"
                              name="qrCode"
                              onChange={handleEditFormChange}
                              accept="image/*"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {editForm.qrCodePreview && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-2">Current Preview:</p>
                                <div className="border rounded-lg p-2 bg-gray-50">
                                  <img 
                                    src={editForm.qrCodePreview} 
                                    alt="QR Code Preview" 
                                    className="max-h-40 mx-auto object-contain rounded"
                                    onError={() => handleImageError('qr', editingMovie._id)}
                                  />
                                </div>
                              </div>
                            )}
                            {!editForm.qrCodePreview && (
                              <p className="mt-2 text-sm text-gray-500 italic">No QR code image available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button for View Mode Only */}
              {!isEditMode && (
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setSelectedMovie(null);
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Close Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare Preview Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaCompress className="mr-2 text-purple-600" />
                    Compare Images
                  </h2>
                  <p className="text-gray-600">Side by side comparison of Ticket and QR Code images</p>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Images Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ticket Image */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FaTicketAlt className="mr-2 text-green-600" /> Ticket Image
                    </h3>
                    <div className="flex justify-center items-center min-h-[300px] bg-white rounded-lg p-4">
                      {editForm.ticketImagePreview ? (
                        <img 
                          src={editForm.ticketImagePreview} 
                          alt="Ticket Preview" 
                          className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Ticket+Image+Not+Available";
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FaTicketAlt className="h-20 w-20 mx-auto mb-3 opacity-30" />
                          <p>No ticket image available</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium text-gray-900">Ticket Image Preview</p>
                      {editForm.ticketImage && (
                        <p className="text-xs text-green-600 mt-1">New file selected: {editForm.ticketImage.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code Image */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FaQrcode className="mr-2 text-purple-600" /> QR Code Image
                    </h3>
                    <div className="flex justify-center items-center min-h-[300px] bg-white rounded-lg p-4">
                      {editForm.qrCodePreview ? (
                        <img 
                          src={editForm.qrCodePreview} 
                          alt="QR Code Preview" 
                          className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=QR+Code+Not+Available";
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FaQrcode className="h-20 w-20 mx-auto mb-3 opacity-30" />
                          <p>No QR code image available</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium text-gray-900">QR Code Preview</p>
                      {editForm.qrCode && (
                        <p className="text-xs text-purple-600 mt-1">New file selected: {editForm.qrCode.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 pt-4 border-t">
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMovies;