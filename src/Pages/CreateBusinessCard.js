import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateBusinessCard = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [tags, setTags] = useState('');
  const [inStock, setInStock] = useState(false);
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions

    if (!name || !categoryName || !price || !offerPrice || !description || !size || !tags || !images.length) {
      setErrorMessage('All fields are required');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', categoryName);
    formData.append('price', price);
    formData.append('offerPrice', offerPrice);
    formData.append('description', description);
    formData.append('size', size);
    formData.append('tags', tags);
    formData.append('inStock', inStock);

    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await axios.post(
        'http://31.97.206.144:4061/api/admin/createbusinesscard',
        formData
      );
      navigate('/businesscardlist');
    } catch (error) {
      console.error('Error creating business card:', error);
      setErrorMessage('Error creating business card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create New Business Card</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-medium mb-2">BusinessCard Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter business card name"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Category Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Price</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Offer Price</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="Enter offer price"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Description</label>
            <textarea
              className="w-full p-3 border rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Size</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter size"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags (e.g. sale, new)"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-lg font-medium mb-2">In Stock</label>
            <input
              type="checkbox"
              className="p-3"
              checked={inStock}
              onChange={() => setInStock(!inStock)}
            />
            <span className="ml-2">Available for sale</span>
          </div>
          <div className="col-span-2">
            <label className="block text-lg font-medium mb-2">Upload Images</label>
            <input
              type="file"
              className="w-full p-3 border rounded-lg"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              {images.length > 0 &&
                Array.from(images).map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-center">{errorMessage}</p>
        )}

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-lg transition duration-300 ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            {loading ? 'Creating...' : 'Create Business Card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBusinessCard;
