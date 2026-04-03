import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
    enum: ['Hair', 'Skin', 'Dentistry'],
  },
  experience: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['verified', 'unverified'],
    default: 'unverified',
  }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
