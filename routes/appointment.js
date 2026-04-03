import express from 'express';
import { getBookingForm, postBooking, getMyAppointments, getAllAppointments, getAppointmentDetails } from '../controllers/appointmentController.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// User pathways
router.get('/book', getBookingForm);
router.post('/book', postBooking);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentDetails);

// Admin pathways
router.get('/', authorizeRoles('admin'), getAllAppointments);

export default router;
