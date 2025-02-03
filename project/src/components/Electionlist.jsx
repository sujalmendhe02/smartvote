import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import context to check the role

const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);
  const { isLoggedIn, role } = useContext(AuthContext); // Access user's role from context
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      setError('You must be logged in to view elections');
      return;
    }

    // Determine which API to call based on role (Admin or User)
    const fetchElections = async () => {
      const apiUrl =
        role === 'admin' ? 'http://localhost:5000/api/admin/elections' : 'http://localhost:5000/api/user/elections';

      try {
        const response = await axios.get(apiUrl);
        setElections(response.data); // Store elections in state
      } catch (err) {
        setError('Failed to fetch elections. Please try again later.');
      }
    };

    fetchElections();
  }, [isLoggedIn, role]);

  // Navigate to a particular election's details page
  const viewElection = (id) => {
    navigate(`/elections/${id}`);
  };

  return (
    <div className="container">
      <h2 className="text-center text-xl font-bold mb-4">Ongoing Elections</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <div
            key={election._id}
            className="border p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
            onClick={() => viewElection(election._id)}
          >
            <h3 className="text-lg font-semibold">{election.title}</h3>
            <p className="text-sm text-gray-600">{election.department} - {election.university}</p>
            <p className="text-sm text-gray-500 mt-2">{election.description}</p>
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                {new Date(election.startDate).toLocaleDateString()} -{' '}
                {new Date(election.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionsList;
