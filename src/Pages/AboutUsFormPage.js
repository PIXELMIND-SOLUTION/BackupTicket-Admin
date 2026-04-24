import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AboutUsFormPage = () => {
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutContent, setAboutContent] = useState("");
  const [date, setDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://31.97.206.144:4061/api/admin/aboutus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: aboutTitle,
          content: aboutContent,
          date,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "About Us section saved successfully!");
        setErrorMessage("");

        // Redirect after short delay
        setTimeout(() => {
          navigate("/getaboutus");
        }, 1500);
      } else {
        setErrorMessage(data.message || "Failed to save About Us section.");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Create About Us</h2>

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

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="aboutTitle" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="aboutTitle"
            value={aboutTitle}
            onChange={(e) => setAboutTitle(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the title of your About Us section"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="aboutContent" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="aboutContent"
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the content of your About Us section"
            rows="8"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
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
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save About Us
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutUsFormPage;
