const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/User');

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/auth/google/callback',
    scope: ['profile', 'email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          status: 'active',
          authType: 'google',
          // Don't set password for Google OAuth users
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);

module.exports = googleStrategy;