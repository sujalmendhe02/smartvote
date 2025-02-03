import React, { useState } from 'react';
import axios from 'axios';

const BecomeCandidate = ({ electionId, token, onRegistrationComplete }) => {
  const [manifesto, setManifesto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `http://localhost:5000/api/user/election/${electionId}/candidates/register`,
        { manifesto },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Successfully registered as a candidate!');
      setManifesto('');
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register as candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Become a Candidate</h3>
      
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="manifesto" className="block text-gray-700 font-medium mb-2">
            Your Manifesto
          </label>
          <textarea
            id="manifesto"
            value={manifesto}
            onChange={(e) => setManifesto(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="6"
            placeholder="Write your election manifesto here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !manifesto.trim()}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register as Candidate'}
        </button>
      </form>
    </div>
  );
};

export default BecomeCandidate;