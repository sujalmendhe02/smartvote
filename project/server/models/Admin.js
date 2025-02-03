// models/Admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role:{type: String, required: true},
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  img: { type: String, default: '' },
  adminId: { type: String, unique: true, required: true, validate: {
    validator: (v) => {
      return /^[a-zA-Z0-9]+$/.test(v);
    },
    message: '{VALUE} is not a valid admin ID'
  }}
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
