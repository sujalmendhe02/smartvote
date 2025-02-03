import express from 'express';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js'; // Authentication middleware

const router = express.Router();

/**
 * Register a user as a candidate for an election.
 * POST /api/elections/:id/candidates/register
 */
export const registerCandidate = async (req, res) => {
  const { manifesto } = req.body;
  const { id: electionId } = req.params;

  try {
    // Check if the election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if the user is already a candidate for this election
    const existingCandidate = await Candidate.findOne({
      user: req.user.id,
      election: electionId,
    });
    if (existingCandidate) {
      return res.status(400).json({ message: 'You are already registered as a candidate for this election.' });
    }

    // Create a new candidate
    const candidate = new Candidate({
      user: req.user.id,
      manifesto,
      department: election.department,
      university: election.university,
      election: electionId,
    });

    await candidate.save();

    res.status(201).json({ message: 'Successfully registered as a candidate', candidate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all candidates for an election.
 * GET /api/elections/:id/candidates
 */
export const getCandidates = async (req, res) => {
  const { id: electionId } = req.params;

  try {
    const candidates = await Candidate.find({ election: electionId }).populate('user', 'name email');
    console.log('Election ID:', electionId);
    console.log('Candidates:', candidates);

    res.status(200).json({ candidates: candidates.length > 0 ? candidates : [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Define routes
// POST /api/elections/:id/candidates/register - Register a user as a candidate
router.post('/:id/candidates/register', authenticateUser, registerCandidate);

// GET /api/elections/:id/candidates - Get all candidates for an election
router.get('/:id/candidates', authenticateUser, getCandidates);

export default router;
