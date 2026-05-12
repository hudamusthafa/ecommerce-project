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
        //  Safe email extraction
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found from Google"), null);
        }

        let user = await User.findOne({ email });

        //  BLOCKED USER CHECK
        if (user && user.isBlocked && !user.isAdmin) {
          return done(null, false, { message: "Account has been blocked by admin" });
        }

        //  Restore soft-deleted user
        if (user && user.isDeleted) {
          user.isDeleted = false;
          await user.save();
        }

        //  Create user if not exists
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            provider: "google",
            password: null //  do NOT store "google"
          });
        }

        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);


//  STORE USER ID IN SESSION
passport.serializeUser((user, done) => {
  done(null,  user._id);
});


// FETCH USER FROM SESSION
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    //  Security check
    if (!user ||  user.isDeleted) {
      return done(null, false);
    }
     if (!user.isAdmin && user.isBlocked) {
      return done(null, false);
    }

    done(null, user);

  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;