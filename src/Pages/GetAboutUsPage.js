import React, { useState, useEffect } from "react";
import axios from "axios";

const GetAboutUsPage = () => {
  const [aboutUsData, setAboutUsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await fetch("http://31.97.206.144:4061/api/admin/getaboutus");
        const data = await response.json();

        if (response.ok) {
          setAboutUsData(data);
          setTitle(data.title || "");
          setContent(data.content || "");
          setDate(data.date ? new Date(data.date).toISOString().slice(0, 10) : "");
          setError("");
        } else {
          setError(data.message || "Failed to fetch About Us data.");
        }
      } catch (err) {
        console.error("Error fetching About Us data:", err);
        setError("An error occurred while fetching About Us data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUsData();
  }, []);

  // Handle update API call
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !date) {
      alert("Please fill in all fields before updating.");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://31.97.206.144:4061/api/admin/updateaboutus/${aboutUsData._id}`,
        { title, content, date }
      );
      alert("About Us updated successfully!");
      setAboutUsData({ ...aboutUsData, title, content, date });
      setEditMode(false);
      setError("");
    } catch (err) {
      console.error("Error updating About Us:", err);
      setError("Failed to update About Us. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete API call
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the About Us data?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `http://31.97.206.144:4061/api/admin/deleteaboutus/${aboutUsData._id}`
      );
      alert("About Us deleted successfully!");
      setAboutUsData(null);
      setTitle("");
      setContent("");
      setDate("");
      setError("");
      setEditMode(false);
    } catch (err) {
      console.error("Error deleting About Us:", err);
      setError("Failed to delete About Us. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500 p-6">Loading About Us information...</div>;

  if (error) return <div className="text-red-600 p-6">{error}</div>;

  if (!aboutUsData)
    return <div className="text-gray-500 p-6">No About Us data found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">About Us</h2>

      {editMode ? (
        <>
          <input
            type="text"
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            className="w-full mb-3 p-2 border border-gray-300 rounded h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
          />
          <input
            type="date"
            className="mb-3 p-2 border border-gray-300 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-4">{aboutUsData.title}</h3>
          <p className="text-gray-700 mb-4 whitespace-pre-line">{aboutUsData.content}</p>
          <p className="text-sm text-gray-500 mb-6">
            Published on: {new Date(aboutUsData.date).toLocaleDateString()}
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-gray-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GetAboutUsPage;
