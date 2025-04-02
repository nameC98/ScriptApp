// middlewares/adminMiddleware.js
import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    // Load the user from the database using the id from the token payload
    const user = await User.findById(req.user.userId).select("+admin");
    if (user && user.admin) {
      return next();
    } else {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default adminMiddleware;
