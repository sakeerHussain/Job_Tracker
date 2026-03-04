import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,                // Always true in production
    sameSite: "none",            // Required for cross-domain cookies
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export default generateTokenAndSetCookie;