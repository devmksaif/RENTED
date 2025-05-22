const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Function to handle Google registration completion or login for existing users
exports.completeGoogleRegistration = async (req, res) => {
  try {
    const { firebaseUid, displayName, email, accountType, meetingArea } = req.body;

    // Check if user already exists by firebaseUid or email
    let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });

    if (user) {
      // Existing user: ensure firebaseUid is set and return token
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
      // Log in existing user
      const token = jwt.sign(
        { userId: user._id, user },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );

      // Return user data and token
      const userObject = user.toObject();
      delete userObject.password; // Don't return password

      // Add debug log for existing user login
      console.log(`Successfully logged in existing user: ${user.email}`);

      return res.status(200).json({ ...userObject, token });

    } else {
      // New user: create a new user record
      // This block should ideally not be reached if frontend navigation for new users is working,
      // but it's a fallback and good for direct testing.
      console.log(`Creating new user for Google login: ${email}`);

      const newUserObj = {
        firebaseUid,
        name: displayName,
        email,
        accountType: accountType || 'both', // Default if not provided
      };

      // If a meeting area is provided for a new user (from frontend registration completion step)
      if (meetingArea && meetingArea.name && meetingArea.latitude && meetingArea.longitude) {
        newUserObj.meetingAreas = [{
          name: meetingArea.name,
          latitude: meetingArea.latitude,
          longitude: meetingArea.longitude,
          isDefault: true
        }];
      }

      const newUser = new User(newUserObj);
      await newUser.save();

      // Log new user creation
      console.log(`Successfully created new user: ${newUser.email}`);

      // Generate token for new user
      const token = jwt.sign(
        { userId: newUser._id, user: newUser },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );

       // Return new user data and token
       const newUserObject = newUser.toObject();
       delete newUserObject.password; // Don't return password

      return res.status(201).json({ ...newUserObject, token });
    }

  } catch (error) {
    console.error('Error in completeGoogleRegistration:', error);
    res.status(500).json({ message: 'Server error during Google login/registration.' });
  }
}; 