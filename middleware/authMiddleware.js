const jwt = require("jsonwebtoken");


// Middleware to authenticate and authorize users based on roles
const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded; // Attach user info to the request

      // Check if the user's role is allowed
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Access denied. Role not authorized." });
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(403).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = { authenticate };
