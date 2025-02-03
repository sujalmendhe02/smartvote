import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import Result from '../models/Result.js';
import Election from '../models/Election.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage });

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, collegeId, className, department, university, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !collegeId || !className || !department || !university || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { collegeId }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'College ID already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      collegeId,
      class: className,
      department,
      university,
      role
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get User Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Update User Profile
router.put('/update-profile/:id', authenticateUser, upload.single('img'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.department) user.department = req.body.department;
    if (req.body.university) user.university = req.body.university;
    if (req.body.class) user.class = req.body.class;
    if (req.file) user.img = req.file.path;

    const updatedUser = await user.save();
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Get Elections
router.get('/elections', authenticateUser, async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.json({ elections });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections' });
  }
});

// Get Single Election
router.get('/elections/:id', authenticateUser, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json({ election });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election' });
  }
});

// Register as Candidate
router.post('/election/:id/candidates/register', authenticateUser, async (req, res) => {
  const { id: electionId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (user.candidateIn.includes(electionId)) {
      return res.status(400).json({ message: 'Already registered as candidate in this election' });
    }

    // Add election to user's candidateIn array
    user.candidateIn.push(electionId);
    await user.save();

    // Create candidate entry
    const candidate = new Candidate({
      user: userId,
      election: electionId,
      manifesto: req.body.manifesto,
      department: user.department,
      university: user.university
    });
    await candidate.save();

    res.status(200).json({ message: 'Successfully registered as candidate' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering as candidate', error: error.message });
  }
});

// Route to fetch all candidates for a specific election
router.get('/election/:id/candidates', authenticateUser, async (req, res) => {
  const { id: electionId } = req.params;

  try {
    // Find the election to ensure it exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Find all candidates for the election and populate user details
    const candidates = await Candidate.find({ election: electionId }).populate(
      'user',
      'name img department class university bio'
    );

    res.status(200).json({ candidates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates', error: error.message });
  }
});

// Cast Vote
router.post('/elections/:id/vote', authenticateUser, async (req, res) => {
  const { id: electionId } = req.params;
  const { candidateId } = req.body;
  const election = await Election.findById(electionId);
  if (!election) {
    return res.status(404).json({ message: 'Election not found' });
  }
  const userId = req.user.id;
  const now = new Date();
  const isActive = now >= new Date(election.startDate) && now <= new Date(election.endDate);

  try {
    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (!isActive) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      voter: userId,
      election: electionId
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Check if candidate exists
    const candidate = await Candidate.findOne({
      user: candidateId,
      election: electionId
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create vote record
    const vote = new Vote({
      voter: userId,
      candidate: candidate._id,
      election: electionId
    });

    await vote.save();

    // Update user's votedIn array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { votedIn: electionId }
    });

    // Increment candidate's vote count
    await User.findByIdAndUpdate(candidateId, {
      $inc: { [`vote.${electionId}.count`]: 1 }
    }, {
      upsert: true,
      setDefaultsOnInsert: true
    });

    // Update candidate's votes array
    await Candidate.findByIdAndUpdate(candidate._id, {
      $push: { votes: vote._id }
    });

    res.status(200).json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ message: 'Error casting vote', error: error.message });
  }
});

// Check Vote Status
router.get('/elections/:id/vote-status', authenticateUser, async (req, res) => {
  try {
    const existingVote = await Vote.findOne({
      voter: req.user.id,
      election: req.params.id
    });

    res.json({ hasVoted: !!existingVote });
  } catch (error) {
    console.error('Vote status check error:', error);
    res.status(500).json({ message: 'Server error while checking vote status' });
  }
});

router.get('/elections/:id/results', authenticateUser, async (req, res) => {
  try {
    const result = await Result.findOne({ election: req.params.id })
      .populate({
        path: 'results.candidate',
        populate: {
          path: 'user',
          select: 'name department class university img'
        }
      })
      .populate('winner', 'name');

    if (!result) {
      return res.status(404).json({ message: 'Results not found' });
    }

    res.json({ result });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Server error while fetching results' });
  }
});

export default router;