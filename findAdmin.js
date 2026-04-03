import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const connectStr = 'mongodb://127.0.0.1:27017/skincare_db';

async function run() {
  try {
    await mongoose.connect(connectStr);

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log("✅ Admin already exists:", existingAdmin.email);
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin"
      });

      console.log("🔥 Admin Created!");
      console.log("Email:", admin.email);
      console.log("Password: admin123");
    }

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

run();