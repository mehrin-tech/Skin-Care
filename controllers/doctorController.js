import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, AuthorizationError } from '../utils/appError.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export const getDoctors = asyncHandler(async (req, res) => {
    const { department } = req.query;
    const dept = department?.toLowerCase();
    
    const doctors = await Doctor.find();
    
    const filteredDoctors = dept
        ? doctors.filter(doc => doc.department && doc.department.toLowerCase() === dept)
        : doctors;
        
    res.render('doctors', { title: 'Our Doctors', doctors: filteredDoctors, user: req.user });
});

export const getAddDoctor = (req, res) => {
    res.render('addDoctor', { title: 'Add Doctor', user: req.user });
};

export const postAddDoctor = asyncHandler(async (req, res) => {
    const { name, department, experience } = req.body;
    const newDoc = new Doctor({ name, department, experience });
    await newDoc.save();
    res.redirect('/doctors');
});

export const deleteDoctor = asyncHandler(async (req, res) => {
    await Doctor.findByIdAndDelete(req.params.id);
    res.redirect('/doctors');
});

export const getDoctorDashboard = asyncHandler(async (req, res) => {
    // Bridge authentic Doctor identity securely reliably natively gracefully using reference
    const activeDoctorAlias = await Doctor.findOne({ userId: req.user._id }) || await Doctor.findOne({ name: req.user.name });
    const explicitId = activeDoctorAlias ? activeDoctorAlias._id : req.user._id;

    const appointments = await Appointment.find({ doctorId: explicitId })
        .populate('userId', 'name phoneNumber age')
        .sort({ date: 1 });
    
    const today = new Date().toDateString();
    const todayAppointmentsCount = appointments.filter(a => {
        return new Date(a.date).toDateString() === today;
    });

    const pendingPatientsCount = appointments.filter(a => a.status === 'pending');
    const completedConsultationsCount = appointments.filter(a => a.status === 'completed');
    
    res.render('doctor/dashboard', { 
        title: 'Doctor Dashboard', 
        user: req.user, 
        appointments,
        totalAppointments: appointments.length,
        todayAppointments: todayAppointmentsCount.length,
        pendingPatients: pendingPatientsCount.length,
        completedConsultations: completedConsultationsCount.length
    });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
    // Bridge authentic identity dynamically seamlessly gracefully reliably
    const activeDoctorAlias = await Doctor.findOne({ userId: req.user._id }) || await Doctor.findOne({ name: req.user.name });
    const explicitId = activeDoctorAlias ? activeDoctorAlias._id : req.user._id;

    const appointments = await Appointment.find({ doctorId: explicitId })
        .populate('userId', 'name age')
        .populate('doctorId', 'name')
        .sort({ date: 1 });
    
    res.render('doctor/appointments', { 
        title: 'Patient Appointments List', 
        user: req.user, 
        appointments 
    });
});

export const getConsultationPage = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('userId', 'name phoneNumber age gender place')
        .populate('doctorId', 'name department');
        
    if (!appointment) throw new NotFoundError('Consultation Matrix Missing.');

    // Allow overriding access explicitly mapping logic matching identity domains
    const activeDoctorAlias = await Doctor.findOne({ userId: req.user._id }) || await Doctor.findOne({ name: req.user.name });
    const validIds = [req.user._id.toString()];
    if (activeDoctorAlias) validIds.push(activeDoctorAlias._id.toString());

    const currentApptId = appointment.doctorId._id ? appointment.doctorId._id.toString() : appointment.doctorId.toString();

    if (!validIds.includes(currentApptId)) {
        throw new AuthorizationError('Unauthorized clinical access natively trapped.');
    }

    const history = await Appointment.find({ 
        userId: appointment.userId._id, 
        status: 'completed'
    }).sort({ date: -1 }).populate('doctorId', 'name department');

    res.render('doctor/patientDetails', {
        title: 'Patient Details',
        user: req.user,
        appointment,
        history
    });
});

export const savePrescription = asyncHandler(async (req, res) => {
    const { medicines } = req.body; 

    // Convert QS sparse arrays and filter explicitly empty rows out securely
    let medsArray = medicines || [];
    if (!Array.isArray(medsArray) && typeof medsArray === 'object') {
        medsArray = Object.values(medsArray);
    }
    
    // Filter out empty medicines to prevent empty objects inside the array natively
    medsArray = medsArray.filter(med => med && med.name && med.name.trim() !== '');

    const updatedAppt = await Appointment.findByIdAndUpdate(req.params.id, {
        medicines: medsArray,
        status: 'completed'
    }, { new: true });
    
    // Native Express Redirection natively effectively mapping constraints structurally
    res.redirect('/doctor/dashboard');
});

export const getDoctorProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).lean();
    let doctor = await Doctor.findOne({ userId: user._id }).lean();
    if (!doctor) doctor = await Doctor.findOne({ name: user.name }).lean();
    
    if (doctor) {
        user.department = doctor.department;
        user.experience = doctor.experience;
    }

    res.render('doctor/profile', { title: 'Doctor Profile', user });
});

export const getEditDoctorProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).lean();
    let doctor = await Doctor.findOne({ userId: user._id }).lean();
    if (!doctor) doctor = await Doctor.findOne({ name: user.name }).lean();
    
    if (doctor) {
        user.department = doctor.department;
        user.experience = doctor.experience;
    }

    res.render('doctor/editProfile', { title: 'Edit Profile', user });
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
    const { name, department, experience } = req.body;
    
    const oldUser = await User.findById(req.user._id);
    const oldName = oldUser.name;

    // Update User explicitly
    await User.findByIdAndUpdate(req.user._id, { name });

    // Safely bridge mapped external Doctor entity natively using active user reference
    let activeDoctorAlias = await Doctor.findOne({ userId: req.user._id });
    if (!activeDoctorAlias) activeDoctorAlias = await Doctor.findOne({ name: oldName });

    if (activeDoctorAlias) {
        await Doctor.findByIdAndUpdate(activeDoctorAlias._id, { name, department, experience, userId: req.user._id });
    } else {
        const newDoc = new Doctor({ name, department, experience, userId: req.user._id });
        await newDoc.save();
    }

    res.redirect('/doctor/profile');
});
