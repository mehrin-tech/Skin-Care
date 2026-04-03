import express from 'express';
import { getHomePage } from '../controllers/homeController.js';
import { getDashboard } from '../controllers/dashboardController.js';
import { getProfile, getEditProfile, updateProfile as updateUserProfile } from '../controllers/profileController.js';
import { getDoctorDashboard, getConsultationPage, savePrescription, getDoctorAppointments, getDoctorProfile, getEditDoctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import { getBookingForm } from '../controllers/appointmentController.js';
import { isAuthenticated, authorizeRoles, protect, isUser } from '../middlewares/authMiddleware.js';
import servicesRoutes from './services.js';
const router = express.Router();

// Home page route
router.get('/', getHomePage);

// Protected Dashboard route exclusively parsing through custom dashboard logic mapping the grid
router.get('/dashboard', isAuthenticated, getDashboard);

// Protected Identity Management Vector 
router.get('/profile', isAuthenticated, getProfile);
router.get('/profile/edit', isAuthenticated, getEditProfile);
router.post('/profile/edit', isAuthenticated, updateUserProfile);

// Protected Doctor Dashboard securely isolating clinical state parameters natively
router.get('/doctor/dashboard', isAuthenticated, authorizeRoles('doctor'), getDoctorDashboard);
router.get('/doctor/appointments', isAuthenticated, authorizeRoles('doctor'), getDoctorAppointments);
router.get('/doctor/patient/:id', isAuthenticated, authorizeRoles('doctor'), getConsultationPage);
router.post('/doctor/prescription/:id', isAuthenticated, authorizeRoles('doctor'), savePrescription);

// Doctor Profile Navigation Architecture inherently smoothly exclusively locked
router.get('/doctor/profile', isAuthenticated, authorizeRoles('doctor'), getDoctorProfile);
router.get('/doctor/profile/edit', isAuthenticated, authorizeRoles('doctor'), getEditDoctorProfile);
router.post('/doctor/profile/edit', protect, authorizeRoles('doctor'), updateDoctorProfile);



// Protected Appointment Booking Route mapping directly
router.get('/book-appointment', protect, isUser, getBookingForm);

router.use('/', servicesRoutes);
export default router;
