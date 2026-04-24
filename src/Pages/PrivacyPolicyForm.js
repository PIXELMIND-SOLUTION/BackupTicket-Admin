import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyForm = () => {
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyContent, setPolicyContent] = useState("");
  const [date, setDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://31.97.206.144:4061/api/admin/privacy-policy", {
        title: policyTitle,
        content: policyContent,
        date,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Privacy policy saved successfully!");
        setPolicyTitle("");
        setPolicyContent("");
        setDate("");

        // Redirect after short delay
        setTimeout(() => {
          navigate("/get-policy");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving privacy policy:", error);
      setErrorMessage("Failed to save privacy policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Create Privacy Policy</h2>

      {/* Success or Error Messages */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Privacy Policy Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="policyTitle" className="block text-sm font-medium text-gray-700">Policy Title</label>
          <input
            type="text"
            id="policyTitle"
            value={policyTitle}
            onChange={(e) => setPolicyTitle(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the title of your privacy policy"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="policyContent" className="block text-sm font-medium text-gray-700">Policy Content</label>
          <textarea
            id="policyContent"
            value={policyContent}
            onChange={(e) => setPolicyContent(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the content of your privacy policy"
            rows="8"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Saving..." : "Save Privacy Policy"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivacyPolicyForm;
