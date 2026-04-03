import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/skincare_db');
    const apps = await Appointment.find({}, 'doctorId userId status date');
    const docs = await Doctor.find({}, '_id name');
    const users = await User.find({ role: 'doctor' }, '_id name email');

    console.log('--- Appointments ---');
    console.log(apps);
    console.log('\n--- Doctor Collection ---');
    console.log(docs);
    console.log('\n--- User Collection (role=doctor) ---');
    console.log(users);
    
    process.exit(0);
}
run();
