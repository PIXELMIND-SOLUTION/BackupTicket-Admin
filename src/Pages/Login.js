import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the API for login using axios
      const response = await axios.post('http://31.97.228.17:8127/api/admin/login', {
        email,
        password
      });

      if (response.data && response.data.success) {
        const { admin } = response.data;
        
        // Store the admin data in localStorage
        // Note: response में adminId आ रहा है, _id नहीं
        localStorage.setItem('adminId', admin.adminId);
        localStorage.setItem('adminName', admin.name);
        localStorage.setItem('adminEmail', admin.email);
        
        // If token exists in response, store it
        if (response.data.token) {
          localStorage.setItem('adminToken', response.data.token);
        }

        // Debug log
        console.log('Login successful! Admin ID:', admin.adminId);
        console.log('Admin data stored in localStorage:', {
          adminId: localStorage.getItem('adminId'),
          name: localStorage.getItem('adminName'),
          email: localStorage.getItem('adminEmail')
        });

        // Redirect to the dashboard after successful login
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Server responded with error
        setError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-100"
    >
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - Form */}
          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-center flex justify-center items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BACKUP
                </span>
                <span className="text-black">TICKET</span>
              </h1>

              <p className="text-gray-700 text-sm mt-1">Admin Login</p>
            </div>

            {error && (
              <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 text-white text-sm font-medium rounded-full transition duration-200
                  ${isLoading
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02]'
                  }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Right - Image */}
          <div className="hidden md:block">
            <img
              src="https://cdn-icons-gif.flaticon.com/11783/11783157.gif"
              alt="Admin Login Illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;