import React, { useState } from 'react';
import axios from 'axios';

const VoteComponent = ({ electionId, candidates, token, hasVoted, onVoteComplete }) => {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `http://localhost:5000/api/user/elections/${electionId}/vote`,
        { candidateId: selectedCandidate },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Vote cast successfully!');
      if (onVoteComplete) {
        onVoteComplete();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  if (hasVoted) {
    return <p className="text-green-600 font-medium">You have already voted in this election.</p>;
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Cast Your Vote</h3>
      
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}

      <form onSubmit={handleVote}>
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <label 
              key={candidate.user._id} 
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="radio"
                name="candidate"
                value={candidate.user._id}
                checked={selectedCandidate === candidate.user._id}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="form-radio text-green-600"
              />
              <div>
                <p className="font-medium">{candidate.user?.name}</p>
                <p className="text-sm text-gray-600">{candidate.manifesto}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedCandidate}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Casting Vote...' : 'Cast Vote'}
        </button>
      </form>
    </div>
  );
};

export default VoteComponent;