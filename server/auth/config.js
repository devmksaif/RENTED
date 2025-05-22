const passport = require('passport');
const googleStrategy = require('./strategies/google');
const User = require('../models/User'); // Add this line to import User model

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(googleStrategy);

module.exports = passport;