const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const apiResponse = require("../utils/api_response");

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 24 * 60 * 60,
  });
};

module.exports.signup_handler = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponse(res, 400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();
    return apiResponse(res, 201, "Account was created successfully");
  } catch (error) {
    return apiResponse(res, 500, "An error occurred during signup", error.message);
  }
};

module.exports.login_handler = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return apiResponse(res, 401, "Login failed! Check authentication credentials");
    }

    const isAuthenticated = await bcrypt.compare(password, user.password);
    if (!isAuthenticated) {
      return apiResponse(res, 401, "Invalid credentials");
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    const token = createToken(user._id);

    return apiResponse(res, 200, "Login was successful", { token, user: userWithoutPassword });
  } catch (error) {
    return apiResponse(res, 500, "An error occurred during login", error.message);
  }
};
