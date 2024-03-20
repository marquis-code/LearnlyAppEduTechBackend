const mongoose = require("mongoose");
const { isMobilePhone } = require("validator");
// const uniqueValidator = require('mongoose-unique-validator');
// const bcrypt = require("bcrypt");
// const bcryptSalt = process.env.BCRYPT_SALT;


let userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      emum: ["author", "editor", "reviewer"],
      required: true,
      default: "author",
    },
    username: {
      type: String,
      trim: true,
      unique: true
    },
    title: {
      type: String,
      required: [true, "please enter a title"],
      trim: true,
    },
    surname: {
      type: String,
      required: [true, "please enter a surname"],
      trim: true,
      unique: true,
    },
    otherNames: {
      type: String,
      required: [true, "please enter other names"],
      trim: true,
      unique: true,
    },
    affirmation: {
      type: String,
      required: [true, "please enter affirmation"],
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: [true, "phone number already exists in database!"],
      validate: {
        validator: function(v) {
          return isMobilePhone(v, 'any', { strictMode: false });
        },
        message: props => `${props.value} is not a valid phone number!`
      }
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
    },
    verified: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);


// userSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });

// userSchema.set("toJSON", {
//   virtuals: true,
// });

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
//   this.password = hash;
//   next();
// });

// userSchema.plugin(uniqueValidator);
const User = mongoose.model("user", userSchema);

module.exports = User;