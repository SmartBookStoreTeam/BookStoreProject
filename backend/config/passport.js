import passport, { use, serializeUser, deserializeUser } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOne, create, findById } from "../models/User";

use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists (registered via email/password)
        user = await findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

serializeUser((user, done) => {
  done(null, user.id);
});

deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
