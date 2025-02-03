// models/Candidate.js
import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  manifesto: { type: String, required: true },
  department: { type: String, required: true },
  university: { type: String, required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
}, { timestamps: true });

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
