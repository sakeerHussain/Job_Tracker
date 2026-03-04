import jwt from "jsonwebtoken";

/**
 * Generates a JWT token only — does NOT set cookie
 * Token is returned in response body instead
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export default generateToken;