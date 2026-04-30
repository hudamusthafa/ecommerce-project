const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        //  create user if not exists
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: "google"
          });
        }

        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// session store
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// session fetch
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    // security check
    if (!user || user.isBlocked || user.isDeleted) {
      return done(null, false);
    }

    done(null, user);

  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;