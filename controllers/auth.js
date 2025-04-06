const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users, Profile, Sequelize, VendorProfile } = require("../models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create an empty profile for the new user
    const newProfile = await Profile.create({
      userId: newUser.id, // Linking profile to the user
    });

    res.status(201).json({
      message: "User registered and profile created successfully",
      user: newUser,
      profile: newProfile, // Return the newly created profile
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Login a user
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // let profile = null;

    // if (user.role === "admin") {
    //   profile = await Profile.findOne({ where: { userId: user.id } });
    //   if (!profile) {
    //     return res
    //       .status(404)
    //       .json({ message: "Profile not found for this user" });
    //   }
    // }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Prepare response data
    const data = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      // profile, // Conditionally includes profile details
      token,
    };

    res.status(200).json({ message: "Login successful", data });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const requestPasswordReset = async (email) => {
  const user = await Users.findOne({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = generateResetToken();
  const resetTokenExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpires;
  await user.save();

  // Send email with the token
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sujannewar7@gmail.com",
      pass: "kmum pyze yxsi tzml",
    },
  });

  console.log(email);

  const mailOptions = {
    from: "sujannewar7@gmail.com",
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Use this token to reset your password: ${resetToken}`,
  };

  await transporter.sendMail(mailOptions);

  return "Password reset token sent to email";
};

const resetPassword = async (token, newPassword) => {
  const user = await Users.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [Sequelize.Op.gt]: new Date() }, // Token is not expired
    },
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.passwordResetToken = null; // Clear the reset token
  user.passwordResetExpires = null; // Clear the expiration time
  await user.save();

  return "Password reset successful";
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await Users.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
};
