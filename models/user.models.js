const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "please enter an email"],
      unique: [true, "email already exists in database!"],
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: '{VALUE} is not a valid email!'
      }
    },
    password: {
      type: String,
      required: [true, "please enter a password"],
      minlength: [6, "Minimum password length is 6 characters"],
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;