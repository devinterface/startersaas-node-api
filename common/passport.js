import passport from "passport";
import passportJWT from "passport-jwt";
import UserService from "../api/users/user.service.js";

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  "jwt",
  new JwtStrategy(opts, async (jwtPayload, done) => {
    const user = await UserService.oneBy({ email: jwtPayload.user.email });
    return done(null, user);
  })
);
