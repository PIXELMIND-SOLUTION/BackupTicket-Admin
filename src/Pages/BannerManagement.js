import { useState, useEffect } from "react";
import { FaUpload, FaEdit, FaTrash, FaImage, FaPlus, FaTimes } from "react-icons/fa";
import axios from "axios";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = "http://31.97.228.17:8127/api/admin";

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/allbanner`);
      
      if (response.data && response.data.success) {
        setBanners(response.data.banners || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/createbanner`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Banner uploaded successfully!");
        setBanners([response.data.banner, ...banners]);
        resetForm();
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      setError(error.response?.data?.message || "Failed to upload banner");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      setError("Please select a new image");
      return;
    }

    if (!editingBanner) {
      setError("No banner selected for editing");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.put(
        `${API_BASE_URL}/updatebanner/${editingBanner._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Banner updated successfully!");
        
        // Update the banner in the list
        setBanners(banners.map(banner => 
          banner._id === editingBanner._id ? response.data.banner : banner
        ));
        
        resetForm();
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      setError(error.response?.data?.message || "Failed to update banner");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      setDeletingId(bannerId);
      setError("");
      
      const response = await axios.delete(`${API_BASE_URL}/deletebanner/${bannerId}`);
      
      if (response.data && response.data.success) {
        setSuccess("Banner deleted successfully!");
        setBanners(banners.filter(banner => banner._id !== bannerId));
        
        // If editing the deleted banner, reset form
        if (editingBanner && editingBanner._id === bannerId) {
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      setError(error.response?.data?.message || "Failed to delete banner");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (banner) => {
    setEditingBanner(banner);
    setSelectedFile(null);
    setImagePreview(`http://31.97.228.17:8127${banner.image}`);
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setEditingBanner(null);
    setError("");
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(""), 3000);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner Management</h1>
        <p className="text-gray-600">Upload and manage homepage banners</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium flex items-center gap-2">
            <FaTimes /> {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Upload Form */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            {editingBanner ? (
              <>
                <FaEdit className="text-blue-500" /> Edit Banner
              </>
            ) : (
              <>
                <FaUpload className="text-blue-500" /> Upload New Banner
              </>
            )}
          </h2>

          {/* Image Preview */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-contain rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                      if (editingBanner) {
                        setImagePreview(`http://31.97.228.17:8127${editingBanner.image}`);
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    title="Remove image"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Click to select a banner image</p>
                  <p className="text-sm text-gray-400">Recommended size: 1920x600px • Max 5MB</p>
                </div>
              )}
              
              <input
                type="file"
                id="banner-image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="banner-image"
                className={`block w-full text-center mt-4 py-3 px-4 rounded-lg cursor-pointer transition ${
                  imagePreview 
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {imagePreview ? "Change Image" : "Select Image"}
              </label>
            </div>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Selected File:</p>
              <p className="text-sm text-blue-600 truncate">{selectedFile.name}</p>
              <p className="text-xs text-blue-500 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {editingBanner ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={updating || !selectedFile}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    updating || !selectedFile
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaEdit /> Update Banner
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  className="py-3 px-6 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  uploading || !selectedFile
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload /> Upload Banner
                  </>
                )}
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Upload Guidelines:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Recommended dimensions: 1920x600 pixels</li>
              <li>• Keep text minimal for better readability</li>
              <li>• Use high-quality images for best results</li>
            </ul>
          </div>
        </div>

        {/* Right Side - Banner List */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaImage className="text-blue-500" /> Banners ({banners.length})
            </h2>
            <div className="text-sm text-gray-600">
              {banners.length} banner{banners.length !== 1 ? 's' : ''}
            </div>
          </div>

          {banners.length === 0 ? (
            <div className="text-center py-12">
              <FaImage className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No banners uploaded yet</p>
              <p className="text-gray-400 mt-2">Upload your first banner to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {banners.map((banner) => (
                <div 
                  key={banner._id} 
                  className={`border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md ${
                    editingBanner && editingBanner._id === banner._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="p-4">
                    {/* Banner Image */}
                    <div className="relative mb-4">
                      <img 
                        src={`http://31.97.228.17:8127${banner.image}`}
                        alt={`Banner ${banner._id}`}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/800x300?text=Banner+Image";
                        }}
                      />
                      {editingBanner && editingBanner._id === banner._id && (
                        <div className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          Editing
                        </div>
                      )}
                    </div>

                    {/* Banner Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Upload Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(banner.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Banner ID</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {banner._id.substring(0, 12)}...
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => startEditing(banner)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          editingBanner && editingBanner._id === banner._id
                            ? "bg-blue-100 text-blue-700"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                        disabled={deletingId === banner._id}
                      >
                        <FaEdit /> {editingBanner && editingBanner._id === banner._id ? "Editing..." : "Edit"}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(banner._id)}
                        disabled={deletingId === banner._id}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          deletingId === banner._id
                            ? "bg-red-100 text-red-400 cursor-not-allowed"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {deletingId === banner._id ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FaTrash /> Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {banners.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Total Banners</p>
                  <p className="text-2xl font-bold text-blue-700">{banners.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold uppercase">Latest Upload</p>
                  <p className="text-sm font-medium text-green-700">
                    {banners.length > 0 ? formatDate(banners[0].createdAt) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">How to Manage Banners</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-700 mb-2">1. Upload New Banner</h4>
            <p className="text-sm text-yellow-600">
              Click "Select Image" on the left panel, choose your banner image, and click Upload.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-700 mb-2">2. Edit Existing Banner</h4>
            <p className="text-sm text-yellow-600">
              Click the "Edit" button on any banner to replace it with a new image.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-700 mb-2">3. Delete Banner</h4>
            <p className="text-sm text-yellow-600">
              Click the "Delete" button to remove a banner permanently. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;