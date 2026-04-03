import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/appError.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

export const getBookingForm = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find();
  res.render('bookAppointment', { title: 'Book an Appointment', doctors, user: req.user });
});

export const postBooking = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.body;
  console.log("User creating appointment:", req.user); // Debug log
  
  // Ensure the doctor actually exists before making a relation
  const doctorExists = await Doctor.findById(doctorId);
  if (!doctorExists) {
    console.warn('Attempted to book an invalid doctor ID:', doctorId);
    throw new ValidationError('Invalid doctor selected. Please choose a valid specialist.');
  }

  const appointment = new Appointment({
    userId: req.user._id,
    doctorId,
    date
  });
  await appointment.save();
  res.redirect('/appointments/my');
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ userId: req.user._id })
    .populate('doctorId')
    .sort({ date: 1 });
  res.render('myAppointments', { title: 'My Appointments', appointments, user: req.user });
});

export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate('userId', 'name phoneNumber age')
    .populate('doctorId', 'name department')
    .sort({ date: 1 });
  res.render('allAppointments', { title: 'All Appointments', appointments, user: req.user });
});

export const getAppointmentDetails = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('doctorId', 'name department')
    .lean();
    
  if (!appointment) throw new NotFoundError('Appointment not found.');

  // Ensure the patient who is logged in actually owns this record seamlessly
  if (appointment.userId.toString() !== req.user._id.toString()) {
    throw new AuthorizationError('Unauthorized to view this medical record.');
  }

  res.render('patientPrescription', { title: 'Medical Record', appointment, user: req.user });
});
