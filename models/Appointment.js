import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'confirmed'],
    default: 'pending',
  },
  notes: {
    type: String,
  },

  medicines: [{
    _id: false,
    name: String,
    dosage: String,
    duration: String,
    instructions: String
  }],
  consultationType: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline',
  },
  tokenNumber: {
    type: Number,
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
