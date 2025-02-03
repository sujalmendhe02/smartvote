import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Ensure the path to AuthContext is correct
import { FaPencilAlt } from 'react-icons/fa';

const Profile = () => {
  const { role, isLoggedIn } = useContext(AuthContext); // Access global role and login state
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/login');
      return;
    }

    fetchProfileData();
  }, [isLoggedIn, token, navigate]);

  const fetchProfileData = async () => {
    try {
      const apiUrl =
        role === 'voter'
          ? 'http://localhost:5000/api/user/profile'
          : 'http://localhost:5000/api/admin/profile';

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(response.data.user);
    } catch (error) {
      setError('Error fetching profile data. Please try again later.'); 
      console.error('Profile fetch error', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 font-medium">Loading...</div>; 
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold">{error}</div>; 
  }

  if (!profileData) {
    return <div className="text-center text-gray-500 font-medium">No profile data available.</div>; // Fallback message
  }

  const handleImageEdit = () => {
    console.log('Image edit button clicked!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 flex flex-col md:flex-row items-center">
        {/* Profile Image */}
        <div className="w-full md:w-1/3 flex flex-col items-center relative">
          <img
            src={profileData.img || 'https://dummyimage.com/150x150'}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full border-2 border-green-500"
          />
          <button
            onClick={handleImageEdit}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200 transition"
          >
            <FaPencilAlt className="text-gray-600" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="w-full md:w-2/3 mt-6 md:mt-0 md:pl-6">
          <h1 className="text-2xl font-bold text-green-600 border-b-2 border-green-600 pb-2 mb-6 text-center md:text-left">
            {role === 'admin' ? 'Admin Profile' : 'User Profile'}
          </h1>
          <div className="space-y-4">
            <p className="text-gray-700">
              <span className="font-bold">Name:</span> {profileData.name}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Email:</span> {profileData.email}
            </p>
            {role === 'admin' ? (
              <>
                <p className="text-gray-700">
                  <span className="font-bold">Admin ID:</span> {profileData.adminId}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Role:</span> Admin
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700">
                  <span className="font-bold">Role:</span> User
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">College ID:</span> {profileData.collegeId}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Class:</span> {profileData.class}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Department:</span> {profileData.department}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">University:</span> {profileData.university}
                </p>
              </>
            )}
            <p className="text-gray-700">
              <span className="font-bold">Account Created On:</span>{' '}
              {new Date(profileData.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Last Updated On:</span>{' '}
              {new Date(profileData.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Update Profile Button */}
      <button
        onClick={() => navigate('/update-profile')}
        className="mt-6 bg-green-600 text-white py-2 px-6 rounded shadow hover:bg-green-700 transition"
      >
        Update Profile
      </button>
    </div>
  );
};

export default Profile;
