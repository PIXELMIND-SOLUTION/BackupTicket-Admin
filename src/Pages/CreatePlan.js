import React, { useState } from "react";
import axios from "axios";
import {
  Button,
} from 'reactstrap';
  import { useNavigate } from 'react-router-dom'; // at the top


const CreatePlan = () => {
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [duration, setDuration] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Correct place for useNavigate hook

  const handleAddFeature = () => {
    if (featureInput.trim() !== "") {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
      setErrorMessage(""); // Clear error if any
    }
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields and at least one feature
    if (
      !name.trim() ||
      !originalPrice.trim() ||
      !offerPrice.trim() ||
      !discountPercentage.trim() ||
      !duration.trim() ||
      features.length === 0
    ) {
      setErrorMessage("Please fill in all fields and add at least one feature.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const data = {
      name,
      originalPrice,
      offerPrice,
      discountPercentage,
      duration,
      features,
    };

    try {
      const response = await axios.post(
        "http://31.97.206.144:4061/api/plans/create-plan",
        data
      );

      alert("Plan created successfully!");

      // Reset form fields
      setName("");
      setOriginalPrice("");
      setOfferPrice("");
      setDiscountPercentage("");
      setDuration("");
      setFeatures([]);
      setFeatureInput("");
      setErrorMessage("");

      // Navigate after success
      navigate("/planlist");
    } catch (error) {
      console.error("Error creating plan:", error);
      setErrorMessage("Failed to create plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">Create New Plan</h2>

      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="Plan Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            className="w-full p-3 border rounded"
            placeholder="Original Price"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
          <input
            type="number"
            className="w-full p-3 border rounded"
            placeholder="Offer Price"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            className="w-full p-3 border rounded"
            placeholder="Discount Percentage"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
          />
          <input
            type="text"
            className="w-full p-3 border rounded"
            placeholder="Duration (e.g. 1 Year)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div className="border rounded p-3">
          <label className="block text-lg font-medium mb-2">Add Features</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Type a feature and click Add"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="bg-blue-500 text-white px-4 rounded"
            >
              Add
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex justify-between items-center">
                {feature}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

      <div className="flex justify-end">
 <Button
  type="submit"
  color="primary"
  className="px-5 py-2 rounded text-sm"
  disabled={loading}
>
  {loading ? "Creating..." : "Create Plan"}
</Button>
</div>

      </form>
    </div>
  );
};

export default CreatePlan;
