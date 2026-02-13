import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProd, // https only in prod
    sameSite: isProd ? "none" : "lax", // critical for cross-origin
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
