const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Task = require("./Task.model");

const SALT_ROUNDS = 10;
const EMAIL_PATTERN =
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const POSTAL_CODE = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, "Email has to be valid"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must have at least 8 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      lowercase: true,
    },
    postalCode: {
      type: Number,
      required: [true, "Postal code is required"],
      match: [POSTAL_CODE, "Enter a valid Postal Code"],
    },
    street: {
      type: String,
      trim: true,
      lowercase: true,
    },
    image:{
      type:String
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.hash(this.password, SALT_ROUNDS).then((hash) => {
      this.password = hash;

      next();
    });
  } else {
    next();
  }
});

userSchema.virtual("tasks", {
  ref: Task.modelName,
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

userSchema.virtual("hired", {
  ref: "Hired",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

userSchema.methods.checkPassword = function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
