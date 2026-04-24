import { useState, useEffect } from "react";
import { FaEdit, FaEye, FaSearch, FaFileExcel, FaFileCsv, FaRupeeSign } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Badge } from 'reactstrap';

export default function RedemptionRequests() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const requestsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    axios
      .get("http://31.97.206.144:4061/api/admin/getredemption-requests")
      .then((res) => {
        if (res.data && res.data.requests) {
          setRequests(res.data.requests);
        }
      })
      .catch((error) => {
        console.error("Error fetching redemption requests:", error);
      });
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;

    try {
      await axios.put(
        `http://31.97.206.144:4061/api/admin/update-status/${selectedRequest._id}`,
        { status }
      );
      alert("✅ Status updated");
      fetchRequests();
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Failed to update");
    }
  };

  const openEditModal = (request) => {
    setSelectedRequest(request);
    setStatus(request.status);
    setShowStatusModal(true);
  };

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const exportData = (type) => {
    const exportRequests = filteredRequests.map((request) => ({
      "ID": request._id,
      "User ID": request.user?._id || "N/A",
      "Name": request.user?.name || "N/A",
      "Email": request.user?.email || "N/A",
      "Mobile": request.user?.mobile || "N/A",
      "Amount": `₹${request.amount}`,
      "Account Holder": request.accountHolderName,
      "Account Number": request.accountNumber,
      "UPI ID": request.upiId || "N/A",
      "IFSC Code": request.ifscCode,
      "Bank Name": request.bankName,
      "Status": request.status,
      "Created At": new Date(request.createdAt).toLocaleString(),
      "Updated At": new Date(request.updatedAt).toLocaleString(),
    }));

    const ws = utils.json_to_sheet(exportRequests);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "RedemptionRequests");
    writeFile(wb, `redemption_requests_${new Date().toISOString().split('T')[0]}.${type}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "Rejected": return "danger";
      case "Processing": return "warning";
      default: return "secondary";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      (request.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (request.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (request.user?.mobile || "").toLowerCase().includes(search.toLowerCase()) ||
      (request.accountHolderName || "").toLowerCase().includes(search.toLowerCase()) ||
      (request.upiId || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const statusCounts = {
    All: requests.length,
    Pending: requests.filter(r => r.status === "Pending").length,
    Completed: requests.filter(r => r.status === "Completed").length,
    Rejected: requests.filter(r => r.status === "Rejected").length,
  };

  return (
    <div className="p-3 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-gray-800 mb-2 md:mb-0">Redemption Requests</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-full"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-1">
            <button 
              className="px-2 py-1.5 bg-green-600 text-white rounded text-sm flex items-center gap-1"
              onClick={() => exportData("csv")}
            >
              <FaFileCsv size={12} /> CSV
            </button>
            <button 
              className="px-2 py-1.5 bg-blue-600 text-white rounded text-sm flex items-center gap-1"
              onClick={() => exportData("xlsx")}
            >
              <FaFileExcel size={12} /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            className={`px-3 py-1 rounded text-xs font-medium ${
              statusFilter === key 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter(key)}
          >
            {key} ({count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-2 text-left text-xs">ID</th>
              <th className="px-3 py-2 text-left text-xs">User</th>
              <th className="px-3 py-2 text-left text-xs">Amount</th>
              <th className="px-3 py-2 text-left text-xs">Bank</th>
              <th className="px-3 py-2 text-left text-xs">UPI ID</th>
              <th className="px-3 py-2 text-left text-xs">Status</th>
              <th className="px-3 py-2 text-left text-xs">Date</th>
              <th className="px-3 py-2 text-left text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request, index) => (
              <tr 
                key={request._id} 
                className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <td className="px-3 py-2">
                  <div className="font-mono text-xs text-gray-600">
                    {request._id.substring(0, 6)}...
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{request.user?.name || "N/A"}</span>
                    <span className="text-xs text-gray-500">{request.user?.mobile || "N/A"}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <FaRupeeSign size={10} className="text-green-600" />
                    <span className="font-bold">₹{request.amount}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs">{request.accountHolderName}</span>
                    <span className="text-xs text-gray-500">***{request.accountNumber.slice(-4)}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className={`px-2 py-0.5 rounded text-xs truncate max-w-[120px] ${
                    request.upiId 
                      ? 'bg-green-100 text-green-800 font-medium' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {request.upiId || "Not Provided"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge 
                    color={getStatusColor(request.status)}
                    className="px-2 py-0.5 rounded-full text-xs"
                    pill
                  >
                    {request.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {new Date(request.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openViewModal(request)}
                      className="text-blue-600 hover:text-blue-800 text-xs p-1"
                      title="View"
                    >
                      <FaEye size={12} />
                    </button>
                    <button
                      onClick={() => openEditModal(request)}
                      className="text-yellow-600 hover:text-yellow-800 text-xs p-1"
                      title="Edit"
                    >
                      <FaEdit size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No requests found
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-xs">
        <div className="text-gray-600 mb-2 sm:mb-0">
          Page {currentPage} of {totalPages} • {filteredRequests.length} requests
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-gray-800 text-white'}`}
          >
            Prev
          </button>
          <span className="px-3 py-1 bg-gray-100 rounded">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200' : 'bg-gray-800 text-white'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={showViewModal} toggle={() => setShowViewModal(false)} size="md">
        <ModalHeader toggle={() => setShowViewModal(false)} className="bg-blue-600 text-white py-2">
          <div className="flex items-center gap-2 text-sm">
            <FaEye /> Request Details
          </div>
        </ModalHeader>
        <ModalBody className="py-3">
          {selectedRequest && (
            <div className="space-y-3 text-sm">
              {/* User Info */}
              <div>
                <h4 className="font-bold text-blue-800 mb-1 text-xs">👤 USER</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-600 text-xs">Name</label>
                    <p className="font-medium">{selectedRequest.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Mobile</label>
                    <p className="font-medium">{selectedRequest.user?.mobile || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-600 text-xs">Email</label>
                    <p className="font-medium">{selectedRequest.user?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="font-bold text-green-800 mb-1 text-xs">💰 PAYMENT</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-600 text-xs">Amount</label>
                    <p className="text-lg font-bold text-green-700 flex items-center gap-1">
                      <FaRupeeSign size={12} /> {selectedRequest.amount}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Status</label>
                    <Badge 
                      color={getStatusColor(selectedRequest.status)}
                      className="px-2 py-0.5 rounded-full text-xs"
                    >
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-bold text-purple-800 mb-1 text-xs">🏦 BANK DETAILS</h4>
                <div className="space-y-1">
                  <div>
                    <label className="text-gray-600 text-xs">Account Holder</label>
                    <p className="font-medium">{selectedRequest.accountHolderName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-600 text-xs">Account No.</label>
                      <p className="font-mono bg-gray-100 p-1 rounded text-xs">{selectedRequest.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">IFSC</label>
                      <p className="font-mono bg-gray-100 p-1 rounded text-xs">{selectedRequest.ifscCode}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Bank</label>
                    <p className="font-medium">{selectedRequest.bankName}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">UPI ID</label>
                    <p className={`font-medium ${selectedRequest.upiId ? 'text-green-700' : 'text-gray-500'}`}>
                      {selectedRequest.upiId || "Not Provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h4 className="font-bold text-gray-800 mb-1 text-xs">🕒 TIMESTAMPS</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-600 text-xs">Created</label>
                    <p className="text-xs">
                      {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Updated</label>
                    <p className="text-xs">
                      {new Date(selectedRequest.updatedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="py-2">
          <Button color="secondary" size="sm" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button 
            color="warning" 
            size="sm"
            onClick={() => {
              setShowViewModal(false);
              openEditModal(selectedRequest);
            }}
          >
            <FaEdit className="mr-1" /> Edit
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Status Modal */}
      <Modal isOpen={showStatusModal} toggle={() => setShowStatusModal(false)} size="sm">
        <ModalHeader toggle={() => setShowStatusModal(false)} className="bg-yellow-500 text-white py-2">
          <div className="flex items-center gap-2 text-sm">
            <FaEdit /> Update Status
          </div>
        </ModalHeader>
        <ModalBody className="py-3">
          <FormGroup>
            <Label for="statusSelect" className="font-bold text-xs">Select Status</Label>
            <Input
              type="select"
              id="statusSelect"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 text-sm"
              size="sm"
            >
              <option value="Pending">⏳ Pending</option>
              <option value="Processing">🔄 Processing</option>
              <option value="Completed">✅ Completed</option>
              <option value="Rejected">❌ Rejected</option>
            </Input>
          </FormGroup>
          {selectedRequest && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p className="text-gray-600">
                <span className="font-bold">{selectedRequest.user?.name}</span> • ₹{selectedRequest.amount}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="py-2">
          <Button color="secondary" size="sm" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button color="primary" size="sm" onClick={handleStatusUpdate}>
            Update
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}