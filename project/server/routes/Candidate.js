// routes/candidate.js
import express from 'express';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import User from '../models/User.js';

const router = express.Router();

// Candidate Registration
router.post('/register', async (req, res) => {
  const { userId, manifesto, electionId } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user is already a candidate
    const existingCandidate = await Candidate.findOne({ user: userId, election: electionId });
    if (existingCandidate) {
      return res.status(400).json({ message: 'User is already registered as a candidate for this election' });
    }

    // Check if the election is active
    const election = await Election.findById(electionId);
    if (!election || election.endDate < new Date()) {
      return res.status(400).json({ message: 'Election has already ended or is not active' });
    }

    // Create a new candidate registration
    const newCandidate = new Candidate({
      user: userId,
      manifesto,
      election: electionId,
      department: user.department,
      university: user.university,
    });

    await newCandidate.save();
    
    // Set user as a candidate
    user.isCandidate = true;
    await user.save();

    res.status(201).json({ message: 'Candidate registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering candidate' });
  }
});

export default router;
