const { Router } = require("express");
const {
  signup_handler,
  login_handler,
  logout_handler,
  reset_handler,
  handle_otp_verification,
  handle_resend_otp_verification,
  handle_forgot_password
} = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signup_handler);

router.post("/login", login_handler);

router.get("/logout", logout_handler);

router.post("/verifyOtp", handle_otp_verification);

router.post("/password-reset", reset_handler);

router.post('/resendOTPVerificationCode', handle_resend_otp_verification)

router.post('/forgot-password', handle_forgot_password)
module.exports = router;
