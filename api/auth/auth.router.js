import * as express from "express";
import passport from "passport";
import { wrap } from "../../common/exceptions.js";
import authController from "./auth.controller.js";

export default express
  .Router()
  .post("/login", wrap(authController.login))
  .post("/signup", wrap(authController.signup))
  .post("/manual-signup", wrap(authController.manualSignup))
  .post("/send-activation-link", wrap(authController.resendActivation))
  .post("/activate/", wrap(authController.activateAccount))
  .post("/send-forgot-password-link", wrap(authController.forgotPassword))
  .post("/reset-password", wrap(authController.resetPassword))
  .post("/sso-login", wrap(authController.ssoLogin))
  .post(
    "/refresh-token",
    passport.authenticate("jwt", { session: false }),
    wrap(authController.refreshToken)
  );
