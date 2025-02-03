import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import { AuthContext } from '../AuthContext';

const UpdateProfile = () => {
  const { role, profileData, setProfileData, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    department: '',
    university: '',
    img: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (profileData) {
      setFormData({
        name: profileData.name || '',
        class: profileData.class || '',
        department: profileData.department || '',
        university: profileData.university || '',
        img: profileData.img || null
      });
    }
  }, [profileData, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, img: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      
      // Only append fields that have values
      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.class) formDataToSend.append('class', formData.class);
      if (formData.department) formDataToSend.append('department', formData.department);
      if (formData.university) formDataToSend.append('university', formData.university);
      if (formData.img instanceof File) formDataToSend.append('img', formData.img);

      const endpoint = role === 'admin'
        ? `http://localhost:5000/api/admin/update-profile/${profileData._id}`
        : `http://localhost:5000/api/user/update-profile/${profileData._id}`;

      const response = await axios.put(endpoint, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setProfileData(response.data.user || response.data.admin);
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold text-green-600 mb-6">Update Profile</h2>
        
        {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
        {success && <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">{success}</div>}

        <div className="flex items-center justify-center mb-6 relative">
          <img
            src={formData.img instanceof File ? URL.createObjectURL(formData.img) : (formData.img || '/default-profile.jpg')}
            alt="Profile Preview"
            className="w-32 h-32 object-cover rounded-full border-2 border-green-500"
          />
          <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow hover:bg-gray-200 cursor-pointer">
            <FaPencilAlt className="text-gray-600" />
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Class</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">University</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded shadow hover:bg-green-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;