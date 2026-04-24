// CreatePosterForm.js
import React, { useState } from 'react';
import axios from 'axios';

const CreatePosterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    categoryName: '',
    price: '',
    description: '',
    size: '',
    festivalDate: '',
    inStock: false,
    tags: '',
    email: '',
    mobile: '',
    textSettings: {},
    logoSettings: '',
  });
  const [images, setImages] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTextSettingsChange = (field, key, value) => {
    setFormData((prev) => ({
      ...prev,
      textSettings: {
        ...prev.textSettings,
        [field]: {
          ...prev.textSettings?.[field],
          [key === 'dx' || key === 'dy' ? 'position' : key]: key === 'dx' || key === 'dy'
            ? {
                ...prev.textSettings?.[field]?.position,
                [key]: value,
              }
            : value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'object' && key === 'textSettings') {
        data.append(key, JSON.stringify(value)); // stringified JSON
      } else {
        data.append(key, value);
      }
    });
    if (images) data.append('images', images);
    if (logo) data.append('logo', logo);

    try {
      const res = await axios.post(
        'http://31.97.206.144:4061/api/poster/create-canvaposter',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResponse(res.data);
    } catch (err) {
      setResponse({ error: err.response?.data || 'Error creating poster' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Poster</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic Fields */}
        {[
          { name: 'name', placeholder: 'Poster Name' },
          { name: 'categoryName', placeholder: 'Category' },
          { name: 'price', placeholder: 'Price', type: 'number' },
          { name: 'description', placeholder: 'Description', type: 'textarea' },
          { name: 'size', placeholder: 'Size (e.g., A4)' },
          { name: 'festivalDate', placeholder: '', type: 'date' },
          { name: 'tags', placeholder: 'Tags (comma separated)' },
          { name: 'email', placeholder: 'Email' },
          { name: 'mobile', placeholder: 'Mobile' },
          { name: 'logoSettings', placeholder: 'Logo Settings (JSON)', type: 'textarea' },
        ].map((input) => (
          input.type === 'textarea' ? (
            <textarea
              key={input.name}
              name={input.name}
              placeholder={input.placeholder}
              value={formData[input.name]}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              rows="3"
            />
          ) : (
            <input
              key={input.name}
              type={input.type || 'text'}
              name={input.name}
              placeholder={input.placeholder}
              value={formData[input.name]}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          )
        ))}

        {/* In Stock */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label>In Stock</label>
        </div>

        {/* Image & Logo */}
        <div>
          <label className="block font-medium">Upload Poster Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImages(e.target.files[0])}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Text Settings */}
        <h3 className="font-semibold text-lg mt-4">Text Settings</h3>
        {["name", "description", "email", "mobile"].map((field) => (
          <div key={field} className="border p-2 rounded mb-4">
            <h4 className="font-semibold capitalize mb-2">{field}</h4>

            <div className="flex gap-2 mb-2">
              <label className="w-20">dx:</label>
              <input
                type="number"
                value={formData.textSettings?.[field]?.position?.dx || ''}
                onChange={(e) =>
                  handleTextSettingsChange(field, 'dx', e.target.value)
                }
                className="border p-1 rounded w-full"
              />
            </div>

            <div className="flex gap-2 mb-2">
              <label className="w-20">dy:</label>
              <input
                type="number"
                value={formData.textSettings?.[field]?.position?.dy || ''}
                onChange={(e) =>
                  handleTextSettingsChange(field, 'dy', e.target.value)
                }
                className="border p-1 rounded w-full"
              />
            </div>

            <div className="flex gap-2 mb-2">
              <label className="w-20">Font:</label>
              <select
                value={formData.textSettings?.[field]?.font || ''}
                onChange={(e) =>
                  handleTextSettingsChange(field, 'font', e.target.value)
                }
                className="border p-1 rounded w-full"
              >
                <option value="">Select Font</option>
                <option value="bold 40px Serif">bold 40px Serif</option>
                <option value="italic 30px Georgia">italic 30px Georgia</option>
                <option value="20px Courier">20px Courier</option>
                <option value="20px Tahoma">20px Tahoma</option>
              </select>
            </div>

            <div className="flex gap-2 mb-2">
              <label className="w-20">Color:</label>
              <input
                type="color"
                value={formData.textSettings?.[field]?.color || '#000000'}
                onChange={(e) =>
                  handleTextSettingsChange(field, 'color', e.target.value)
                }
                className="border p-1 rounded w-full"
              />
            </div>
          </div>
        ))}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Poster'}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CreatePosterForm;
