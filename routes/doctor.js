import express from 'express';
import { getDoctors, getAddDoctor, postAddDoctor, deleteDoctor } from '../controllers/doctorController.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All doctor routes are protected for authenticated users natively
router.use(isAuthenticated);

// View doctors (accessible to all authenticated users safely)
router.get('/', getDoctors);

// Admin-only scoped routes for mutating the DB state
router.get('/add', authorizeRoles('admin'), getAddDoctor);
router.post('/add', authorizeRoles('admin'), postAddDoctor);
router.post('/delete/:id', authorizeRoles('admin'), deleteDoctor);

export default router;
