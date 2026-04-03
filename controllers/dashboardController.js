import { asyncHandler } from '../utils/asyncHandler.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch user details to ensure we get newest data including age, gender, profileImage
  const user = await User.findById(userId);

  // Fetch appointments historically sorted
  const appointments = await Appointment.find({ userId })
    .populate('doctorId')
    .sort({ date: -1 });

  const totalAppointments = appointments.length;

  const now = new Date();
  const upcomingAppointments = appointments.filter(appt => new Date(appt.date) >= now);
  const pastAppointments = appointments.filter(appt => new Date(appt.date) < now);

  const upcomingCount = upcomingAppointments.length;
  const lastVisitDate = pastAppointments.length > 0 ? pastAppointments[0].date : null;

  // Truncate to limit 5 cleanly
  const recentAppointments = appointments.slice(0, 5);

  // If user's profile image is default generic, personalize it with their name specifically
  const profileImageUrl = user.profileImage && user.profileImage.includes('api/?name=User') 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
    : user.profileImage;

  res.render('dashboard', {
    title: 'User Clinical Dashboard',
    user: {
      ...user.toObject(),
      profileImage: profileImageUrl,
    },
    stats: {
      total: totalAppointments,
      upcoming: upcomingCount,
      lastVisit: lastVisitDate
    },
    recentAppointments
  });
});
