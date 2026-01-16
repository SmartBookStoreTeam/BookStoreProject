import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // prevents leaking password hash in most queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    isVerified: { type: Boolean, default: false, index: true },

    avatar: { type: String },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
