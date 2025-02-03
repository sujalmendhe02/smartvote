// routes/adminRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import Admin from '../models/Admin.js';
import Election from '../models/Election.js';
import Result from '../models/Result.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage });

// Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, adminId, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !adminId || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { adminId }] });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: existingAdmin.email === email ? 'Email already registered' : 'Admin ID already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      adminId,
      role
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Admin Profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ profile: admin });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Update Admin Profile
router.put('/update-profile/:id', authenticateAdmin, upload.single('img'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update fields if provided
    if (req.body.name) admin.name = req.body.name;
    if (req.file) admin.img = req.file.path;

    const updatedAdmin = await admin.save();
    res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

router.post('/election', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      class: electionClass,
      department,
      university,
      startDate,
      endDate,
      eligibility
    } = req.body;

    if (!title || !university || !startDate || !endDate || !eligibility.university) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const newElection = new Election({
      title,
      description,
      class: electionClass,
      department,
      university,
      startDate,
      endDate,
      isActive: true,
      createdBy: req.admin.id, // Add this line to store the admin who created the election
      eligibility: {
        class: eligibility.class,
        department: eligibility.department,
        university: eligibility.university
      }
    });

    await newElection.save();
    res.status(201).json({ message: 'Election created successfully', election: newElection });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
});

// Get Elections
router.get('/elections', authenticateAdmin, async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.json({ elections });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections' });
  }
});

// Get Single Election
router.get('/elections/:id', authenticateAdmin, async (req, res) => {
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



// Declare Election Results
router.post('/elections/:id/declare-results', authenticateAdmin, async (req, res) => {
  try {
    const { id: electionId } = req.params;
    
    // Find election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if election has ended
    const now = new Date();
    if (now < new Date(election.endDate)) {
      return res.status(400).json({ message: 'Cannot declare results before election ends' });
    }

    // Get all candidates with their votes
    const candidates = await Candidate.find({ election: electionId })
      .populate('user', 'name email department class university');

    // Get vote counts for each candidate
    const results = await Promise.all(candidates.map(async (candidate) => {
      const voteCount = await Vote.countDocuments({
        candidate: candidate._id,
        election: electionId
      });

      return {
        candidate: candidate._id,
        user: candidate.user,
        votes: voteCount
      };
    }));

    // Sort results by vote count in descending order
    results.sort((a, b) => b.votes - a.votes);

    // Create or update result document
    const result = await Result.findOneAndUpdate(
      { election: electionId },
      {
        election: electionId,
        results: results.map((r, index) => ({
          candidate: r.candidate,
          votes: r.votes,
          rank: index + 1
        })),
        winner: results[0]?.candidate || null,
        declaredAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Close election
    election.isActive = false;
    await election.save();

    res.json({
      message: 'Election results declared successfully',
      result: {
        ...result.toObject(),
        results: results.map((r, index) => ({
          ...r,
          rank: index + 1
        }))
      }
    });
  } catch (error) {
    console.error('Error declaring results:', error);
    res.status(500).json({ message: 'Server error while declaring results' });
  }
});

// Get Election Results
router.get('/elections/:id/results', authenticateAdmin, async (req, res) => {
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


router.delete('/elections/:id/delete', authenticateAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if the admin who created the election is the one trying to delete it
    if (election.createdBy?.toString() !== req.admin.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this election' });
    }

    // Delete associated votes
    await Vote.deleteMany({ election: req.params.id });
    
    // Delete associated candidates
    await Candidate.deleteMany({ election: req.params.id });
    
    // Delete associated results
    await Result.deleteMany({ election: req.params.id });
    
    // Delete the election
    await Election.findByIdAndDelete(req.params.id);

    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ message: 'Server error while deleting election' });
  }
});

export default router;