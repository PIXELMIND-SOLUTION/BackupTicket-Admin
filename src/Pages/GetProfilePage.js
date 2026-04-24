import React, { useState, useEffect } from "react";
import { FaUser, FaEdit, FaSave, FaTimes, FaCamera, FaEnvelope, FaPhone, FaCalendarAlt, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const GetProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "",
    profileImage: null 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = "http://31.97.206.144:8127/api/admin";

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get adminId from localStorage
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        setError("No admin ID found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/getprofile/${adminId}`);
      
      if (response.data && response.data.success) {
        const admin = response.data.admin;
        setProfileData(admin);
        setFormData({
          name: admin.name || "",
          email: admin.email || "",
          phone: admin.phone || "",
          profileImage: null
        });
        
        // Set image preview if profile image exists
        if (admin.profileImage) {
          setImagePreview(`http://31.97.206.144:8127${admin.profileImage}`);
        } else {
          setImagePreview("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
        }
      } else {
        setError("Failed to fetch profile data.");
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      if (err.response) {
        setError(err.response.data.message || "Failed to fetch profile data.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }

      setFormData((prev) => ({ ...prev, profileImage: file }));
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError("");
      setSuccessMessage("");

      const adminId = localStorage.getItem("adminId");
      
      if (!adminId) {
        setError("Admin ID not found. Please log in again.");
        setUpdating(false);
        return;
      }

      // Create FormData for file upload
      const updateData = new FormData();
      
      // Append only changed fields
      if (formData.name && formData.name !== profileData?.name) {
        updateData.append("name", formData.name);
      }
      
      if (formData.email && formData.email !== profileData?.email) {
        updateData.append("email", formData.email);
      }
      
      if (formData.phone !== profileData?.phone) {
        updateData.append("phone", formData.phone || "");
      }
      
      // Append profile image if selected
      if (formData.profileImage) {
        updateData.append("profileImage", formData.profileImage);
      }

      const response = await axios.put(
        `${API_BASE_URL}/updateProfile/${adminId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.success) {
        const updatedAdmin = response.data.admin;
        setProfileData(updatedAdmin);
        
        // Update localStorage
        localStorage.setItem("adminName", updatedAdmin.name);
        localStorage.setItem("adminEmail", updatedAdmin.email);
        
        // Update image preview
        if (updatedAdmin.profileImage) {
          localStorage.setItem("adminProfileImage", updatedAdmin.profileImage);
          setImagePreview(`http://31.97.206.144:8127${updatedAdmin.profileImage}`);
        } else if (formData.profileImage) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(formData.profileImage);
        }
        
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response) {
        if (err.response.status === 404) {
          setError("Admin not found. Please log in again.");
          localStorage.clear();
          window.location.href = "/login";
        } else if (err.response.status === 400) {
          setError(err.response.data.message || "Invalid data provided.");
        } else {
          setError(err.response.data.message || "Failed to update profile.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setUpdating(false);
    }
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

  const truncateEmail = (email) => {
    if (!email) return "N/A";
    if (email.length <= 30) return email;
    return email.substring(0, 27) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FaUser className="text-blue-500" />
          Admin Profile
        </h1>
        <p className="text-gray-600">View and manage your admin profile information</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-100"
                />
                
                {isEditing && (
                  <label htmlFor="profile-image" className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition">
                    <FaCamera />
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                {profileData?.name || "Admin"}
              </h2>
              <p className="text-gray-600" title={profileData?.email}>
                {truncateEmail(profileData?.email)}
              </p>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            {/* Admin ID */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaKey className="text-gray-400" />
                <p className="text-sm text-gray-500">Admin ID</p>
              </div>
              <p className="font-mono text-gray-900 text-sm break-all">
                {profileData?._id || localStorage.getItem('adminId')}
              </p>
            </div>

            {/* Member Since */}
            {profileData?.createdAt && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-blue-400" />
                  <p className="text-sm text-blue-600">Member Since</p>
                </div>
                <p className="font-medium text-blue-800">
                  {formatDate(profileData.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Profile Information
            </h3>

            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{profileData?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <FaEnvelope className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900" title={profileData?.email}>
                          {truncateEmail(profileData?.email)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FaPhone className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {profileData?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <FaKey className="text-amber-600" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Password</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-semibold text-gray-900">
                                {showPassword ? profileData?.password || "••••••••" : "••••••••"}
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600 transition"
                                title={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Click the eye icon to {showPassword ? "hide" : "show"} password
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FaCalendarAlt className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(profileData?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <FaCalendarAlt className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(profileData?.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Image Status */}
                <div className="bg-blue-50 p-5 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">Profile Image Status</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {profileData?.profileImage ? "Profile image uploaded" : "No profile image set"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Click "Edit Profile" to change your profile picture
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Enter your name"
                      required
                    />
                    {formData.name !== profileData?.name && (
                      <p className="text-xs text-blue-600 mt-1">Changed from: {profileData?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Enter your email"
                      required
                    />
                    {formData.email !== profileData?.email && (
                      <p className="text-xs text-blue-600 mt-1">Changed from: {profileData?.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter your phone number"
                  />
                  {formData.phone !== profileData?.phone && (
                    <p className="text-xs text-blue-600 mt-1">
                      Changed from: {profileData?.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <label className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition flex items-center gap-2">
                        <FaCamera /> Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {formData.profileImage && (
                        <span className="text-sm text-green-600">
                          ✓ New image selected
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max 2MB • JPG, PNG, WebP</p>
                      <p className="text-xs text-gray-400">
                        Leave empty to keep current image
                      </p>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  {formData.profileImage && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">New Image Preview:</p>
                      <div className="flex justify-center">
                        <img
                          src={imagePreview}
                          alt="New Profile Preview"
                          className="h-32 rounded-lg border-2 border-blue-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Info (Read-only) */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-gray-900">
                          {showPassword ? profileData?.password || "••••••••" : "••••••••"}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 transition"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Password cannot be changed from here. Use the Change Password option from the main menu.
                  </p>
                </div>

                {/* Current Admin ID Display */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Current Admin ID</p>
                  <p className="font-mono text-gray-900 text-sm">
                    {profileData?._id || localStorage.getItem('adminId')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Admin ID cannot be changed</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={updating}
                    className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      updating
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                      // Reset form data to original
                      if (profileData) {
                        setFormData({
                          name: profileData.name || "",
                          email: profileData.email || "",
                          phone: profileData.phone || "",
                          profileImage: null
                        });
                        if (profileData.profileImage) {
                          setImagePreview(`http://31.97.206.144:8127${profileData.profileImage}`);
                        } else {
                          setImagePreview("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
                        }
                      }
                    }}
                    className="py-3 px-6 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Name and email are required fields for login</li>
              <li>• Phone number is optional but recommended</li>
              <li>• Profile image should be less than 2MB</li>
              <li>• Supported image formats: JPG, PNG, WebP</li>
              <li>• Password can be changed from Change Password menu</li>
              <li>• All changes are saved immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetProfilePage;