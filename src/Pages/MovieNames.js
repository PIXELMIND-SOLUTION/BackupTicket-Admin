import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilm, FaImage, FaUpload, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";

const MovieNames = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    MovieName: "",
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const moviesPerPage = 8;

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://31.97.228.17:8127/api/admin/allmovienames");
      
      if (response.data && response.data.movies) {
        setMovies(response.data.movies);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      alert("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.MovieName.trim()) {
      alert("Movie name is required");
      return;
    }

    const data = new FormData();
    data.append("MovieName", formData.MovieName);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingId) {
        // Update movie
        await axios.put(`http://31.97.228.17:8127/api/admin/updatemoviename/${editingId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert("Movie updated successfully!");
      } else {
        // Create movie
        await axios.post("http://31.97.228.17:8127/api/admin/createmoviename", data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert("Movie created successfully!");
      }
      
      resetForm();
      fetchMovies();
    } catch (error) {
      console.error("Error saving movie:", error);
      const errorMsg = error.response?.data?.message || "Failed to save movie";
      alert(errorMsg);
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      MovieName: movie.MovieName,
      image: null
    });
    setEditingId(movie._id);
    setImagePreview(movie.image ? `http://31.97.228.17:8127${movie.image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (movieId) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await axios.delete(`http://31.97.228.17:8127/api/admin/deletemoviename/${movieId}`);
        alert("Movie deleted successfully");
        fetchMovies();
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      MovieName: "",
      image: null
    });
    setEditingId(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const filteredMovies = movies.filter((movie) =>
    (movie.MovieName || "").toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Movie Names Management</h1>
        <p className="text-gray-600">Create and manage movie names with images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Create/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Movie" : "Create New Movie"}
              </h2>
              {showForm && (
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2 font-medium"
              >
                <FaPlus /> Create New Movie
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movie Name *
                  </label>
                  <input
                    type="text"
                    name="MovieName"
                    value={formData.MovieName}
                    onChange={handleInputChange}
                    placeholder="Enter movie name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movie Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-blue-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="py-8">
                          <FaUpload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <FaSave /> {editingId ? "Update Movie" : "Create Movie"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Movies</p>
                  <p className="text-xl font-bold text-blue-600">{movies.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">With Images</p>
                  <p className="text-xl font-bold text-green-600">
                    {movies.filter(m => m.image).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Movies List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Movie Details
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
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
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FaFilm className="text-blue-500 mr-2" />
                            <div className="text-sm font-semibold text-gray-900">
                              {movie.MovieName || "N/A"}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {movie._id?.substring(0, 10)}...
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        {movie.image ? (
                          <div className="relative group">
                            <img 
                              src={`http://31.97.228.17:8127${movie.image}`}
                              alt={movie.MovieName}
                              className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/64?text=No+Image";
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <FaImage className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                            <FaImage className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(movie.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(movie.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(movie)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 hover:border-blue-300"
                            title="Edit Movie"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(movie._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200 hover:border-red-300"
                            title="Delete Movie"
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
                  <FaFilm className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No movies found</p>
                <p className="text-gray-400 mt-2">
                  {search ? "Try adjusting your search criteria" : "Create your first movie using the form on the left"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredMovies.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstMovie + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(indexOfLastMovie, filteredMovies.length)}</span> of{" "}
                <span className="font-semibold">{filteredMovies.length}</span> movies
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
        </div>
      </div>
    </div>
  );
};

export default MovieNames;