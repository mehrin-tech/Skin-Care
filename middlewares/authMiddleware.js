import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.redirect('/login');
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access the requested page.',
      });
    }
    next();
  };
};

// Middleware to protect routes (check if logged in)
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.redirect('/auth/login?message=Please login to book an appointment');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.redirect('/auth/login?message=Please login to book an appointment');
  }
};

// Middleware to redirect already logged-in users to their dashboards
export const redirectIfLoggedIn = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        if (user.role === 'admin') return res.redirect('/admin/dashboard?message=Already logged in. Please logout first.');
        if (user.role === 'doctor') return res.redirect('/doctor/dashboard?message=Already logged in. Please logout first.');
        return res.redirect('/dashboard?message=Already logged in. Please logout first.');
      }
    } catch (error) {
      // Token invalid or expired, proceed to login/signup
    }
  }
  next();
};


// Middleware to check if the user role is 'user'
export const isUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403).render('error', { title: 'Access Denied', message: 'Access denied. You do not have permission to access the requested page.' });
  }
};
