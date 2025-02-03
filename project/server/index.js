import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Import Routes
import userRoutes from './routes/User.js';
import adminRoutes from './routes/Admin.js';
import candidateRoutes from './routes/Candidate.js';
import electionRoutes from './routes/Elections.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY  ,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const checkCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Connected to Cloudinary:', result); 
  } catch (error) {
    console.error('Failed to connect to Cloudinary:', error);
    console.error('Error details:', error.response ? error.response.data : error.message);
  }
};


checkCloudinaryConnection();

// Initialize dotenv for environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS

// Database connection

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use Routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/elections', electionRoutes);


// Set up port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
