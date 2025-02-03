import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import VoteComponent from './VoteComponent';
import BecomeCandidate from './BecomeCandidate';

const ElectionDetails = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [electionResults, setElectionResults] = useState(null);
  const { token, role, profileData } = useContext(AuthContext);
  const [isCandidate, setIsCandidate] = useState(false);
  const isActive = (startDate, endDate) => {
    const currentDate = new Date();
    console.log(currentDate);
    console.log(currentDate >= new Date(startDate) && currentDate <= new Date(endDate));
    return currentDate >= new Date(startDate) && currentDate <= new Date(endDate);
  };

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const apiUrl = role === 'admin'
          ? `http://localhost:5000/api/admin/elections/${id}`
          : `http://localhost:5000/api/user/elections/${id}`;

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.election) {
          setElection(response.data.election);
          await fetchCandidates();
          const electionData = response.data.election;
          if (!isActive(electionData.startDate, electionData.endDate)) {
            await fetchResults();
          }
          if (role !== 'admin') {
            await checkVoteStatus();
          }
        }
         else {
          setError('Election data not found');
        }
      } catch (err) {
        setError('Failed to fetch election details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchElectionDetails();
    }
  }, [id, role, token]);

  const fetchResults = async () => {
    try {
      const apiUrl = role === 'admin'
        ? `http://localhost:5000/api/admin/elections/${id}/results`
        : `http://localhost:5000/api/user/elections/${id}/results`;

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElectionResults(response.data.result);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const declareResults = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/elections/${id}/declare-results`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchResults();
      setElection(prev => ({ ...prev, isActive: false }));
    } catch (err) {
      setError('Failed to declare results');
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/elections/${id}/vote-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setHasVoted(response.data.hasVoted);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/election/${id}/candidates`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCandidates(response.data.candidates || []);
      if (profileData) {
        setIsCandidate(response.data.candidates.some(
          candidate => candidate.user._id === profileData._id
        ));
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const handleVoteComplete = async () => {
    await checkVoteStatus();
    await fetchCandidates();
  };

  const checkEligibility = (user, electionEligibility) => {
    if (!user || !electionEligibility) return false;
    if (electionEligibility.university !== user.university) return false;
    if (electionEligibility.department && 
        electionEligibility.department !== user.department) return false;
    if (electionEligibility.class && 
        electionEligibility.class !== user.class) return false;
    return true;
  };

  const isEligible = React.useMemo(() => {
    if (!profileData || !election || !election.eligibility) {
      return false;
    }
    return checkEligibility(profileData, election.eligibility);
  }, [profileData, election]);

  const renderCandidateProfile = (candidate) => {
    const candidateResult = electionResults?.results?.find(r => r.candidate._id === candidate._id);
    const isWinner = electionResults?.winner?._id === candidate._id;

    return (
      <div key={candidate._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24">
            <img
              src={candidate.user?.img || '/img/default-avatar.png'}
              alt={candidate.user?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
            />
            {!isActive(election.startDate, election.endDate) && isWinner && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                👑
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-800">
              {candidate.user?.name}
              {!isActive(election.startDate, election.endDate) && isWinner && (
                <span className="ml-2 text-green-600">(Winner)</span>
              )}
            </h4>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Department:</span> {candidate.user?.department}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Class:</span> {candidate.user?.class}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">University:</span> {candidate.user?.university}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h5 className="font-semibold text-gray-800 mb-2">Manifesto:</h5>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{candidate.manifesto}</p>
        </div>
        {candidate.user?.bio && (
          <div className="mt-4">
            <h5 className="font-semibold text-gray-800 mb-2">Bio:</h5>
            <p className="text-gray-700">{candidate.user.bio}</p>
          </div>
        )}
        {!isActive(election.startDate, election.endDate) && candidateResult && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Votes Received:</span>
              <span className="text-lg font-bold text-green-600">
                {candidateResult.votes}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                Rank: {candidateResult.rank} of {candidates.length}
              </span>
            </div>
          </div>
        )}
        {isActive(election.startDate, election.endDate) && !hasVoted && isEligible && !isCandidate && (
          <div className="mt-4">
            <VoteComponent
              electionId={id}
              candidates={[candidate]}
              token={token}
              hasVoted={hasVoted}
              onVoteComplete={handleVoteComplete}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="pt-20 text-center">Loading...</div>;
  if (error) return <div className="pt-20 text-red-500 text-center">{error}</div>;
  if (!election) return <div className="pt-20 text-center">Election not found</div>;

  return (
    <div className="pt-20 pb-8 px-6 sm:px-12 lg:px-20 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{election.title}</h2>
          <p className="text-lg text-gray-700 mb-4">{election.description}</p>
          
          <div className="mb-4">
            {election.department && (
              <p className="text-sm text-gray-600">
                <strong>Department:</strong> {election.department}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>University:</strong> {election.university}
            </p>
            {election.class && (
              <p className="text-sm text-gray-600">
                <strong>Class:</strong> {election.class}
              </p>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Eligibility Criteria:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>University: {election.eligibility.university}</li>
              {election.eligibility.department && (
                <li>Department: {election.eligibility.department}</li>
              )}
              {election.eligibility.class && (
                <li>Class: {election.eligibility.class}</li>
              )}
            </ul>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              <strong>Start Date:</strong> {new Date(election.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              <strong>End Date:</strong> {new Date(election.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {role === 'admin' && !isActive(election.startDate, election.endDate) && !electionResults && (
          <div className="mb-6">
            <button
              onClick={declareResults}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Declare Results
            </button>
          </div>
        )}

        {role !== 'admin' && isActive(election.startDate, election.endDate) && (
          <div className="mb-6">
            {isEligible ? (
              <>
                {!isCandidate && (
                  <BecomeCandidate
                    electionId={id}
                    token={token}
                    onRegistrationComplete={fetchCandidates}
                  />
                )}

                {candidates.length > 0 && !hasVoted && (
                  <VoteComponent
                    electionId={id}
                    candidates={candidates}
                    token={token}
                    hasVoted={hasVoted}
                    onVoteComplete={handleVoteComplete}
                  />
                )}
              </>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">You are not eligible to participate in this election.</p>
                <p className="text-sm text-gray-600 mt-2">
                  Please ensure you meet all the required eligibility criteria.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {isActive(election.startDate, election.endDate) ? 'Candidates' : 'Election Results'}
          </h3>
          {candidates.length > 0 ? (
            candidates.map(renderCandidateProfile)
          ) : (
            <p className="text-gray-600 text-center py-4">No candidates registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionDetails;