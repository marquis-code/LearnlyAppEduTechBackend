const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user.models");
const apiResponse = require("../utils/api_response");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiResponse(res, 403, "Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return apiResponse(res, 401, "User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return apiResponse(res, 401, "Invalid token.");
    } else if (error.name === "TokenExpiredError") {
      return apiResponse(res, 401, "Token has expired.");
    } else {
      return apiResponse(res, 500, "Internal server error.");
    }
  }
};

module.exports = { verifyUser };
