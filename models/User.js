import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'doctor'],
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  phoneNumber: {
    type: String,
  },
  place: {
    type: String,
  },
  profileImage: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random',
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
