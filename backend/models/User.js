import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      // Make password NOT required (for Google OAuth users)
      required: function () {
        return !this.googleId; // Only required if not using Google
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    // Add these new fields for Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    isVerified: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String, // Store Google profile picture URL
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  // لو الباسورد مش متعدل أو مش موجود (Google user)
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords in login
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Return false if user doesn't have a password (Google OAuth user)
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
