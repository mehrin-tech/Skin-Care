import express from 'express';
import { getLogin, postLogin, getSignup, postSignup, logout } from '../controllers/authController.js';
import { redirectIfLoggedIn } from '../middlewares/authMiddleware.js';
import { validateLogin, validateRegistration } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/login', redirectIfLoggedIn, getLogin);
router.post('/login', redirectIfLoggedIn, validateLogin, postLogin);

router.get('/signup', redirectIfLoggedIn, getSignup);
router.post('/signup', redirectIfLoggedIn, validateRegistration, postSignup);

router.get('/logout', logout);

export default router;
