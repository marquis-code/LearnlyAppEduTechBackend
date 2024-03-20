const User = require("../models/user.models");
const Token = require("../models/token.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const OTPVerification = require("../models/OTPVerification");
const Mailgen = require("mailgen");

function generateUsername(surname, otherName) {
  // Extract the first letter of the other name and combine it with the surname
  const initialOfOtherName = otherName.charAt(0).toLowerCase();
  const processedSurname = surname.toLowerCase().replace(/\s+/g, '');

  // Generate a random number to append for uniqueness
  const randomNumber = Math.floor(Math.random() * 1000);

  // Construct the username
  const username = `${initialOfOtherName}${processedSurname}${randomNumber}`;

  return username;
}

const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "J-AIRDOTA Team.",
    link: "https://mailgen.js/",
    copyright: "Copyright © 2024 J-AIRDOTA. All rights reserved.",
  },
});

let mailtrapTransport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_AUTH_USER,
    pass: process.env.MAILTRAP_AUTH_PASSWORD,
  },
});

const sendOTPVerificationEmail = async ({ _id, email, username }, res) => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const emailMessage = {
    body: {
      greeting: "Dear",
      signature: "Sincerely",
      title: `Hello, ${username}`,
      intro: `We recieved a request to access your J-AIRDOTA Account ${email} through your email address. Your One Time OTP verification code is: ${otp}`,
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  let emailBody = MailGenerator.generate(emailMessage);

  const mailTrapMailOptions = {
    from: process.env.ACADEMY_AUTH_EMAIL,
    to: email,
    subject: "J-AIRTA Email Verification Code (One Time Password)", // Subject line
    html: emailBody,
  };

  mailtrapTransport.sendMail(mailTrapMailOptions, async function (err, info) {
    if (err) {
      console.log(err);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otp, salt);
      const newOTPVerification = await new OTPVerification({
        userId: _id,
        otp: hashedOtp,
        expiresAt: Date.now() + 1800000,
        createdAt: Date.now(),
      });
      await newOTPVerification.save();
      return res.status(200).json({
        successMessage: "Verification otp email sent.",
        data: { userId: _id, email },
      });
    }
  });
};

const createToken = (userId, userRole) => {
  const accessToken = jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: 24 * 60 * 60 * 1000,
  });
  return accessToken;
};

module.exports.signup_handler = async (req, res) => {
  try {
    const {
      title,
      email,
      password,
      role,
      surname,
      otherNames,
      affirmation,
      phone,
    } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errorMessage: "User Already Exist" });
    }
    const hash = await bcrypt.hash(password, 10); //Hash the password
    const newAdminUser = new User({
      title,
      email,
      password: hash,
      role,
      surname,
      otherNames,
      affirmation,
      phone,
      verified: false,
      username: generateUsername(surname, otherNames)
    });
    newAdminUser
      .save()
      .then((result) => {
        sendOTPVerificationEmail(result, res);
      })
      .catch((error) => {
        console.log(error)
        return res.json({
          errorMessage:
            "Something went wrong, while saving user account, please try again.",
        });
      });
  } catch (error) {
    return res.json({
      errorMessage:
      "Something went wrong, while saving user account, please try again.",
    });
  }
};

module.exports.login_handler = async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ username: login }, { email: login }] });
    if (!user) {
      return res.status(401).json({ errorMessage: 'Login failed! Check authentication credentials' });
    }
    let auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ errorMessage: "Invalid credentials!" });
    }
    const token = createToken(user._id, user.role)
    res.status(200).json({
      token,
      role: user.role,
      message: "Logged in Successfully",
    });
    // sendOTPVerificationEmail(user, res);
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

module.exports.logout_handler = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    return res.status(200).json({ successMessage: "Logout was successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: "Something went wrong. Please try again" });
  }
};

module.exports.reset_handler = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    // Find the user with the provided reset token
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    if (!user) {
      return res.status(400).send('Invalid or expired password reset token.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

     // Update the user's password and reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.ACADEMY_AUTH_EMAIL,
      subject: 'Password Reset Success',
      text: 'Password was successful. Login to your J-AIRDOTA account with your new password.',
    }
    mailtrapTransport.sendMail(mailOptions, (err) => {
      if (err) return res.status(500).send('Error sending email.');
      res.status(200).json({
        message: 'Congratulations ' + user.surname + ' password reset was successful.'
      });
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ errorMessage: "" });
  }
};

module.exports.handle_otp_verification = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({
        errorMessage: "Empty OTP details are not allowed.",
      });
    } else {
      const userOTPVerificationRecords = await OTPVerification.find({
        userId,
      });

      if (userOTPVerificationRecords.length <= 0) {
        return res.status(400).json({
          errorMessage:
            "Account record doesn't exist or has been verified already. Please signup or log in",
        });
      } else {
        const { expiresAt } = userOTPVerificationRecords[0];
        const hashedOtp = userOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          await OTPVerification.deleteMany({ userId });
          return res.status(400).json({
            errorMessage: "Code has expired. Please request again.",
          });
        } else {
          const validOtp = bcrypt.compare(otp, hashedOtp);

          if (!validOtp) {
            return res.status(400).json({
              errorMessage: "Invalid code passed. Check your inbox.",
            });
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await OTPVerification.deleteMany({ userId });
            const user = await User.findOne({ _id: userId });

            const token = createToken(user._id, user.role);
            res.cookie("jwt", token, {
              maxAge: 24 * 60 * 60 * 1000,
              httpOnly: true,
              secure: true,
            });

            return res.status(200).json({
              user: {
                username: user.username,
                email: user.email,
                role: user.role,
              },
              successMessage: "Account was created successfully. ✅",
              accessToken: token,
            });
          }
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
    });
  }
};

module.exports.handle_resend_otp_verification = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({
        errorMessage: "Empty user details are not allowed.",
      });
    } else {
      await OTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
    });
  }
};

module.exports.handle_forgot_password = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send('No account with that email address exists.');
      }
  
      // Generate a token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetURL = `https://${req.headers.host}/reset-password?token=${resetToken}`;
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await user.save();
  
      // Send email
      const mailOptions = {
        to: email,
        from: process.env.ACADEMY_AUTH_EMAIL,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
              `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
              `${resetURL}\n\n` +
              `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
  
      mailtrapTransport.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).send('Error sending email.');
        res.status(200).json({
          message: 'An email has been sent to ' + email + ' with further instructions.'
        });
      });
    } catch (error) {
      res.status(500).json({
        errorMessage: 'Error on forgot password.'
      });
    }
}