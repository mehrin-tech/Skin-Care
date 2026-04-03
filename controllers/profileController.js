import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('profile', { 
        title: 'My Profile', 
        user, 
        success: req.query.success === 'true' 
    });
});

export const getEditProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('editProfile', { title: 'Edit Profile', user, error: null });
});

export const updateProfile = asyncHandler(async (req, res) => {
    let { name, phoneNumber, age, gender, place } = req.body;
    
    // Exact mathematical string trimming tracking variables stably
    name = name ? name.trim() : '';
    phoneNumber = phoneNumber ? phoneNumber.trim() : '';
    place = place ? place.trim() : '';
    
    // Explicit logical validation bounds capturing parameters cleanly
    let error = null;
    if (!name) error = 'Complete Identity Designation (Name) is required.';
    if (!phoneNumber) error = 'Mobile Connection vector is currently explicitly required.';
    if (age && isNaN(age)) error = 'Age mathematical bounds strictly execute numerical schemas.';
    
    if (error) {
        // Repopulate user model visually safely via existing ID
        const user = await User.findById(req.user._id);
        // Reapply failed permutations avoiding wiping data purely
        user.name = name; 
        user.phoneNumber = phoneNumber; 
        user.age = age; 
        user.gender = gender; 
        user.place = place;
        return res.render('editProfile', { title: 'Edit Profile', user, error });
    }
    
    // Execute absolute strict update exclusively locking structural parameters
    await User.findByIdAndUpdate(req.user._id, {
        name, 
        phoneNumber, 
        age: age ? parseInt(age) : null, 
        gender, 
        place
    }, { new: true });
    
    res.redirect('/profile?success=true');
});
