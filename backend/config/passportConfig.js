// passportConfig.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"; // Correct import syntax
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID, // Ensure this matches your .env variable
      clientSecret: process.env.clientSecret, // Ensure this matches your .env variable
      callbackURL: "/auth/google/callback", // Adjust as per your route
    },
    (accessToken, refreshToken, profile, done) => {
      // Logic to handle user information after Google authentication
      // e.g., find or create a user in your database
      return done(null, profile); // Or handle errors
    }
  )
);

// Serialize and deserialize user instances to and from sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport; // Export the passport instance
