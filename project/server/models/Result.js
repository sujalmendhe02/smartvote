import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  results: [{
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    votes: { type: Number, default: 0 },
    rank: { type: Number, required: true }
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  declaredAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);
export default Result;