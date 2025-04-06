const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

const upload = require("../middleware/multer");
const {
  register,
  login,
  changePassword,
  resetPassword,
  requestPasswordReset,
} = require("../controllers/auth");
const {
  getProfileByUserId,
  updateProfile,
  verifyProfile,
  getAllUser,
  getProfileByUserIdAdmin,
} = require("../controllers/profile");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate(["user"]), getProfileByUserId);
router.get("/users/:id", getProfileByUserIdAdmin);
router.patch("/profile/:id", upload.single("profilePicture"), updateProfile);
router.put("/verify-profile/:id", verifyProfile);
router.get("/users", authenticate(["admin"]), getAllUser);

router.post(
  "/change-password",
  authenticate(["user", "admin"]),
  changePassword
);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const message = await requestPasswordReset(email);
    res.status(200).send({ message });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const message = await resetPassword(token, newPassword);
    res.status(200).send({ message });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/check-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    res.status(403).json({ valid: false, message: "Invalid or expired token" });
  }
});

module.exports = router;
