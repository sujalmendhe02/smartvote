import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Trash2 } from 'lucide-react';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);
  const { profileData, isLoggedIn, role, token } = useContext(AuthContext);
  const [showAddElection, setShowAddElection] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchElections = async () => {
      try {
        const apiUrl = role === 'admin'
          ? 'http://localhost:5000/api/admin/elections'
          : 'http://localhost:5000/api/user/elections';

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElections(response.data.elections || []);
      } catch (err) {
        setError('Failed to fetch elections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [isLoggedIn, role, token, navigate]);

  const handleElectionClick = (electionId) => {
    navigate(`/elections/${electionId}`);
  };

  const addElection = async (electionData) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/election',
        electionData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.election) {
        setElections(prev => [...prev, response.data.election]);
        setShowAddElection(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election. Please try again.');
    }
  };

  const isActive = (startDate, endDate) => {
    const currentDate = new Date();
    console.log(currentDate);
    return currentDate >= new Date(startDate) && currentDate <= new Date(endDate);
  };
  



  
  
  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/elections/${electionId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the deleted election from the state
      setElections(prev => prev.filter(election => election._id !== electionId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete election');
    }
  };

  const renderElectionCard = (election) => (
    console.log(isActive(election.startDate, election.endDate)),
    <div
      key={election._id}
      className="bg-white border rounded-lg shadow-md hover:shadow-lg transition"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{election.title}</h3>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                isActive(election.startDate, election.endDate)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              { isActive(election.startDate, election.endDate) ? 'Active' : 'Closed'}
            </span>
            {role === 'admin' && election.createdBy === profileData?._id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteElection(election._id);
                }}
                className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                title="Delete Election"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">{election.description}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <p>
            <span className="font-medium">University:</span> {election.university}
          </p>
          {election.department && (
            <p>
              <span className="font-medium">Department:</span> {election.department}
            </p>
          )}
          {election.class && (
            <p>
              <span className="font-medium">Class:</span> {election.class}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <p>Start: {new Date(election.startDate).toLocaleDateString()}</p>
              <p>End: {new Date(election.endDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElectionClick(election._id);
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  


  if (loading) {
    return (
      <div className="pt-20 flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading elections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 px-6 sm:px-12 lg:px-20 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
          {role === 'admin' ? 'Manage Elections' : 'Available Elections'}
        </h2>

        {role === 'admin' && (
          <div className="mb-6">
            <button
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              onClick={() => setShowAddElection(true)}
            >
              Add Election
            </button>
          </div>
        )}

        {elections.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">No elections available at the moment.</p>
            {role === 'admin' && (
              <p className="mt-2">Click the "Add Election" button to create a new election.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {elections.map(renderElectionCard)}
          </div>
        )}

        {showAddElection && (
          <AddElectionModal
            onClose={() => setShowAddElection(false)}
            onAddElection={addElection}
          />
        )}
      </div>
    </div>
  );
};

const AddElectionModal = ({ onClose, onAddElection }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    university: '',
    class: '',
    startDate: '',
    endDate: '',
    eligibility: {
      class: '',
      department: '',
      university: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      eligibility: { ...prev.eligibility, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create payload with optional fields
    const payload = {
      title: formData.title,
      description: formData.description,
      university: formData.university,
      startDate: formData.startDate,
      endDate: formData.endDate,
      eligibility: {
        university: formData.eligibility.university,
      },
    };

    // Add optional fields only if they have values
    if (formData.department) payload.department = formData.department;
    if (formData.class) payload.class = formData.class;
    if (formData.eligibility.department) payload.eligibility.department = formData.eligibility.department;
    if (formData.eligibility.class) payload.eligibility.class = formData.eligibility.class;

    onAddElection(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Add New Election</h3>
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Department (Optional)</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Class (Optional)</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">University</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Eligibility</label>
            <div className="space-y-2">
              <input
                type="text"
                name="class"
                value={formData.eligibility.class}
                onChange={handleEligibilityChange}
                placeholder="Class (Optional)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                name="department"
                value={formData.eligibility.department}
                onChange={handleEligibilityChange}
                placeholder="Department (Optional)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                name="university"
                value={formData.eligibility.university}
                onChange={handleEligibilityChange}
                placeholder="University"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
  
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Election
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default Elections;