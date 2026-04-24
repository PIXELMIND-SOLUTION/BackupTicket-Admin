import React, { useState, useEffect } from "react";
import axios from "axios";

const PrivacyPolicyPage = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get(
          "http://31.97.206.144:4061/api/admin/getpolicy"
        );
        setPrivacyPolicy(response.data);
        setTitle(response.data.title || "");
        setContent(response.data.content || "");
        setDate(response.data.date ? new Date(response.data.date).toISOString().slice(0, 10) : "");
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        setError("Failed to load privacy policy.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !date) {
      alert("Please fill in all fields before updating.");
      return;
    }
    try {
      setLoading(true);
      await axios.put(
        `http://31.97.206.144:4061/api/admin/updatepolicy/${privacyPolicy._id}`,
        { title, content, date }
      );
      alert("Privacy policy updated successfully!");
      setPrivacyPolicy({ ...privacyPolicy, title, content, date });
      setEditMode(false);
      setError("");
    } catch (err) {
      console.error("Error updating privacy policy:", err);
      setError("Failed to update privacy policy.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the privacy policy?")) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(
        `http://31.97.206.144:4061/api/admin/deletepolicy/${privacyPolicy._id}`
      );
      alert("Privacy policy deleted successfully!");
      setPrivacyPolicy(null);
      setTitle("");
      setContent("");
      setDate("");
      setError("");
    } catch (err) {
      console.error("Error deleting privacy policy:", err);
      setError("Failed to delete privacy policy.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="text-red-500">{error}</div>;

  if (!privacyPolicy)
    return <div>No privacy policy found. You can create one in admin panel.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
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
          <h2 className="text-3xl font-semibold text-blue-900 mb-4">
            {privacyPolicy.title}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Effective Date: {new Date(privacyPolicy.date).toLocaleDateString()}
          </p>
          <div className="text-gray-700 leading-relaxed text-lg space-y-4 whitespace-pre-line">
            {privacyPolicy.content}
          </div>
          <div className="mt-6 flex space-x-3">
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

export default PrivacyPolicyPage;
