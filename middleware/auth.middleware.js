const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user.models");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ errorMessage: "Something went wrong." });
      } else {
        next();
      }
    });
  } else {
    return res.status(401).json({ errorMessage: "Access denied" });
  }
};

const checkUser = (req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ errorMessage: err.message });
      }
      if (decodedToken.role !== 'author' || decodedToken.role !== 'editor' || decodedToken.role !== 'reviewer') {
        return res.status(401).json({ errorMessage: "Access Denied. You need Admin role access." });
      }
      User.findById(decodedToken.id).then((user) => {
        res.locals.user = user;
        next();
      }).catch((err) => {
        return res.status(500).json({ errorMessage: err.message })
      })
    }
    )
  } else {
    return res.status(403).json({ errorMessage: "Access denied." });
    // next();
  }
};

module.exports = { requireAuth, checkUser };
