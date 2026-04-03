import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/appError.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const doctorCount = await Doctor.countDocuments();
  const userCount = await User.countDocuments();
  const appointmentCount = await Appointment.countDocuments();

  // Temporal logic bounds
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

  // Growth counts
  const usersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
  const appointmentsToday = await Appointment.countDocuments({ createdAt: { $gte: startOfDay } });
  
  // Chart Data Arrays
  const last7Days = [];
  for(let i=6; i>=0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last7Days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0,0,0,0);

  const apptAggregation = await Appointment.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
    }}
  ]);

  const cleanApptCounts = last7Days.map((_, index) => {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - (6 - index));
      const matchString = targetDate.toISOString().split('T')[0];
      const matchObj = apptAggregation.find(a => a._id === matchString);
      return matchObj ? matchObj.count : 0;
  });

  const userAggregation = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
    }}
  ]);

  const userCounts = last7Days.map((_, index) => {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - (6 - index));
    const matchString = targetDate.toISOString().split('T')[0];
    const matchObj = userAggregation.find(a => a._id === matchString);
    return matchObj ? matchObj.count : 0;
  });

  res.render('admin/dashboard', { 
    title: 'Admin Analytics Dashboard', 
    user: req.user,
    stats: {
      doctors: doctorCount,
      users: userCount,
      appointments: appointmentCount,
      usersThisWeek,
      appointmentsToday
    },
    chartData: {
      labels: last7Days,
      appointments: cleanApptCounts,
      users: userCounts
    }
  });
});

// --- User Management ---
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit) || 1;

  res.render('admin/users', { 
    title: 'Identity Roles Matrix', 
    user: req.user, 
    users,
    currentPage: page,
    totalPages
  });
});

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await Appointment.find()
    .populate('userId', 'name phoneNumber age')
    .populate('doctorId', 'name department')
    .sort({ date: -1 });

  res.render('admin/patients', {
    title: 'Patient Directory',
    user: req.user,
    patients
  });
});

export const getPatientRecord = asyncHandler(async (req, res) => {
  // 1. Extract the actual Patient Identity (userId) from the clicked URL params
  const baseAppointment = await Appointment.findById(req.params.id);
  if (!baseAppointment) {
    throw new NotFoundError('Patient Record Not Located');
  }

  const activePatientId = baseAppointment.userId;

  // 2. Smart Fetch: Prioritize the LATEST appointment containing actual medicines
  let targetAppointment = await Appointment.findOne({ 
      userId: activePatientId, 
      'medicines.0': { $exists: true } // MongoDB trick checking array is NOT empty
  })
  .sort({ date: -1 }) // Sort newest first
  .populate('userId', 'name email age gender phoneNumber place')
  .populate('doctorId', 'name department');

  // 3. Fallback: If patient has zero medicines on any session, just render their newest appointment
  if (!targetAppointment) {
      targetAppointment = await Appointment.findOne({ userId: activePatientId })
      .sort({ date: -1 })
      .populate('userId', 'name email age gender phoneNumber place')
      .populate('doctorId', 'name department');
  }

  // 4. Pass the intelligent payload to EJS
  res.render('admin/patientDetails', {
    title: 'Patient Prescription',
    user: req.user,
    record: targetAppointment 
  });
});

export const deletePatientRecord = asyncHandler(async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users');
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (['user', 'doctor', 'admin'].includes(role)) {
    await User.findByIdAndUpdate(id, { role });
  }
  res.redirect('/admin/users');
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users');
});

// --- Doctor Management ---
export const getAdminDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().sort({ createdAt: -1 });
  res.render('admin/doctors', { title: 'Manage Doctors', user: req.user, doctors });
});

export const changeDoctorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (['verified', 'unverified'].includes(status)) {
    await Doctor.findByIdAndUpdate(id, { status });
  }
  res.redirect('/admin/doctors');
});

// --- Appointment Management ---
export const getAdminAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);
    filter.date = { $gte: d, $lt: nextDay };
  }

  const appointments = await Appointment.find(filter)
    .populate('userId', 'name email')
    .populate('doctorId', 'name department')
    .sort({ date: -1 });

  res.render('admin/appointments', { 
    title: 'Manage Appointments', 
    user: req.user, 
    appointments, 
    query: req.query 
  });
});

export const changeAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (['pending', 'completed', 'cancelled'].includes(status)) {
    await Appointment.findByIdAndUpdate(id, { status });
  }
  res.redirect('/admin/appointments');
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.redirect('/admin/appointments');
});
