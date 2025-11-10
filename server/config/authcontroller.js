import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../models/user.js";
import { Warehouse } from "../models/warehouse.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      callbackURL: process.env.AUTH_GOOGLE_CALLBACK_URL,
      passReqToCallback: true, 
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          let existingUser = await User.findOne({ email: profile.emails[0].value });

          if (existingUser) {
            existingUser.googleId = profile.id;
            existingUser.accessToken = accessToken;
            existingUser.refreshToken = refreshToken || existingUser.refreshToken;
            existingUser.authType = "google";
            existingUser.profileImg = profile.photos[0]?.value || existingUser.profileImg;

            /*let warehouse = await Warehouse.findOne({ userID: existingUser._id });
            if (warehouse) {
              existingUser.wareId = warehouse._id; 
            }*/

            await existingUser.save();
            return done(null, existingUser);
          }

  
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            accessToken: accessToken, 
            refreshToken: refreshToken || "", 
            authType: "google",
            profileImg: profile.photos[0]?.value || "https://lh3.googleusercontent.com/a/default-user-photo.jpg",
            isNewUser: true,
          });

          await user.save();
        } else {
          user.accessToken = accessToken;
          if (refreshToken) user.refreshToken = refreshToken;
          await user.save();
        }

        done(null, user);
      } catch (err) {
        console.error("Error in Google authentication:", err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
