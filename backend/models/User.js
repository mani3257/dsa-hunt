const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },

    passwordHash: {
      type: String,
      required: function () {
        return !this.githubId && !this.googleId;
      },
    },

    passwordSalt: {
      type: String,
      required: function () {
        return !this.githubId && !this.googleId;
      },
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
