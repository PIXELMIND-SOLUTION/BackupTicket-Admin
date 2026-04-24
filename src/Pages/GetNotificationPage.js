import React, { useState, useEffect } from "react";
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaInfoCircle,
  FaTrash,
  FaEye,
  FaTimes,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown
} from "react-icons/fa";
import axios from "axios";

const GetNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingNotification, setViewingNotification] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const API_BASE_URL = "http://31.97.228.17:8127/api/admin";

  const notificationTypes = {
    info: { 
      icon: <FaInfoCircle className="text-blue-500 text-sm" />, 
      badgeColor: "bg-blue-100 text-blue-800",
      title: "Information"
    },
    warning: { 
      icon: <FaExclamationTriangle className="text-amber-500 text-sm" />, 
      badgeColor: "bg-amber-100 text-amber-800",
      title: "Warning"
    },
    success: { 
      icon: <FaCheckCircle className="text-green-500 text-sm" />, 
      badgeColor: "bg-green-100 text-green-800",
      title: "Success"
    },
    error: { 
      icon: <FaExclamationTriangle className="text-red-500 text-sm" />, 
      badgeColor: "bg-red-100 text-red-800",
      title: "Error"
    },
    created: { 
      icon: <FaCheckCircle className="text-green-500 text-sm" />, 
      badgeColor: "bg-green-100 text-green-800",
      title: "Created"
    },
    updated: { 
      icon: <FaInfoCircle className="text-blue-500 text-sm" />, 
      badgeColor: "bg-blue-100 text-blue-800",
      title: "Updated"
    },
    deleted: { 
      icon: <FaExclamationTriangle className="text-red-500 text-sm" />, 
      badgeColor: "bg-red-100 text-red-800",
      title: "Deleted"
    }
  };

  const getNotificationTypeConfig = (type) => {
    return notificationTypes[type] || {
      icon: <FaInfoCircle className="text-gray-500 text-sm" />,
      badgeColor: "bg-gray-100 text-gray-800",
      title: type || "Notification"
    };
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        setError("No admin ID found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/getnotifications/${adminId}`);
      
      if (response.data && response.data.success) {
        const mappedNotifications = (response.data.notifications || []).map(notification => ({
          _id: notification._id,
          title: notification.status === "created" ? "New Ticket Booked" : 
                 notification.status === "updated" ? "Ticket Updated" :
                 notification.status === "deleted" ? "Ticket Cancelled" : "Notification",
          message: notification.message,
          type: notification.status || "info",
          createdAt: notification.createdAt,
          isRead: false,
          ticketId: notification.ticketId,
          status: notification.status
        }));
        
        setNotifications(mappedNotifications);
      } else {
        setError("Failed to fetch notifications.");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleViewNotification = (notification) => {
    setViewingNotification(notification);
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    
    try {
      setDeletingId(notificationId);
      const adminId = localStorage.getItem("adminId");
      
      const response = await axios.delete(`${API_BASE_URL}/deletenotifications/${adminId}/${notificationId}`);
      
      if (response.data && response.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        if (viewingNotification && viewingNotification._id === notificationId) {
          setViewingNotification(null);
        }
        
        setSuccessMessage("Notification deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to delete ALL notifications?")) return;
    
    try {
      setLoading(true);
      const adminId = localStorage.getItem("adminId");
      
      const response = await axios.delete(`${API_BASE_URL}/deleteallnotifications/${adminId}`);
      
      if (response.data && response.data.success) {
        setNotifications([]);
        setViewingNotification(null);
        setSuccessMessage("All notifications deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      setError("Failed to delete all notifications.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400 text-xs" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-blue-600 text-xs" /> : 
      <FaSortDown className="text-blue-600 text-xs" />;
  };

  // Sort notifications
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    if (sortConfig.key === 'title') {
      return sortConfig.direction === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    
    if (sortConfig.key === 'type') {
      return sortConfig.direction === 'asc'
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    }
    
    return 0;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FaBell className="text-blue-500" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-sm">Manage your notifications</p>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={fetchNotifications}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={deleteAllNotifications}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium flex items-center gap-1"
              >
                <FaTrash className="text-xs" /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{notifications.length}</p>
            </div>
            <FaBell className="text-blue-500 text-lg" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Unread</p>
              <p className="text-lg font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xs">{unreadCount}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-lg font-bold text-green-600">
                {notifications.filter(n => n.type === 'created').length}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-lg" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Other</p>
              <p className="text-lg font-bold text-blue-600">
                {notifications.filter(n => !['created', 'updated', 'deleted'].includes(n.type)).length}
              </p>
            </div>
            <FaInfoCircle className="text-blue-500 text-lg" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              All Notifications ({notifications.length})
            </h3>
            <div className="flex items-center gap-1">
              <FaFilter className="text-gray-400 text-xs" />
              <span className="text-xs text-gray-500">Click headers to sort</span>
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-300 mb-3">
              <FaBell className="text-4xl mx-auto mb-2" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">You'll see notifications here when they arrive.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-20"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-40"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Message
                  </th>
                  <th 
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Date & Time
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedNotifications.map((notification) => {
                  const typeConfig = getNotificationTypeConfig(notification.type);
                  
                  return (
                    <tr 
                      key={notification._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {typeConfig.icon}
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {notification.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {notification.title}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[250px]">
                          <p className="text-gray-600 text-sm truncate" title={notification.message}>
                            {notification.message.length > 50 
                              ? `${notification.message.substring(0, 50)}...`
                              : notification.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.isRead 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.isRead ? 'Read' : 'New'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewNotification(notification)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="View"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            disabled={deletingId === notification._id}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === notification._id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <FaTrash className="text-sm" />
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
        )}
      </div>

      {/* Notification Detail Modal */}
      {viewingNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Notification Details</h3>
                <button
                  onClick={() => setViewingNotification(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded bg-gray-100">
                    {getNotificationTypeConfig(viewingNotification.type).icon}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{viewingNotification.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        getNotificationTypeConfig(viewingNotification.type).badgeColor
                      }`}>
                        {viewingNotification.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        viewingNotification.isRead 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingNotification.isRead ? 'READ' : 'UNREAD'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Message</h5>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{viewingNotification.message}</p>
                </div>
                
                {/* Ticket Information (if available) */}
                {viewingNotification.ticketId && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <h5 className="text-xs font-medium text-blue-700 mb-2">Ticket Information</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-blue-600">Movie: {viewingNotification.ticketId.MovieName}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-blue-600">Language: {viewingNotification.ticketId.language}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Theatre: {viewingNotification.ticketId.theatrePlace}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-blue-600">
                            Date: {new Date(viewingNotification.ticketId.showDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600">Time: {viewingNotification.ticketId.showTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <h6 className="text-xs font-medium text-gray-700 mb-1">Created At</h6>
                    <div className="text-gray-600 text-xs">
                      {formatDate(viewingNotification.createdAt)}
                    </div>
                  </div>
                  
                  {viewingNotification.updatedAt && viewingNotification.updatedAt !== viewingNotification.createdAt && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Last Updated</h6>
                      <div className="text-gray-600 text-xs">
                        {formatDate(viewingNotification.updatedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteNotification(viewingNotification._id)}
                  disabled={deletingId === viewingNotification._id}
                  className="flex-1 py-2.5 bg-red-50 text-red-600 rounded font-medium hover:bg-red-100 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === viewingNotification._id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="text-xs" /> Delete
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setViewingNotification(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200 transition text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetNotificationPage;