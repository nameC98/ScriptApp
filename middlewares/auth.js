import jwt from "jsonwebtoken";

export const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // decoded should include { userId, admin } if set during login
      next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res
        .status(401)
        .json({ error: "Not authorized, token failed or expired" });
    }
  } else {
    return res.status(401).json({ error: "No token provided" });
  }
};
