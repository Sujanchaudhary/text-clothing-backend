const { Profile, Users, VendorProfile } = require("../models");
const nodemailer = require("nodemailer");

// Get a single profile by ID with associated user data
const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id }, // Filter by userId
      include: {
        model: Users, // Include associated user data
        attributes: ["id", "email", "role"], // Customize which user data to include
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found for the specified userId" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res
      .status(500)
      .json({ message: "Error retrieving profile", error: error.message });
  }
};

const getProfileByUserIdAdmin = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.params.id }, // Filter by userId
      include: {
        model: Users, // Include associated user data
        attributes: ["id", "email", "role"], // Customize which user data to include
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found for the specified userId" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res
      .status(500)
      .json({ message: "Error retrieving profile", error: error.message });
  }
};

// Update a profile by ID and include user data
const updateProfile = async (req, res) => {
  try {
    // Check if a file is uploaded and set the image path
    const profilePicture = req.file ? req.file.path : null;

    // Fetch the profile by ID
    const profile = await Profile.findByPk(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update the profile with the new data from the request body
    const updateData = { ...req.body };

    // If an avatar is uploaded, include it in the update data
    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    await profile.update(updateData);

    // Optionally, return the user data along with the updated profile
    const updatedProfile = await Profile.findByPk(req.params.id, {
      include: {
        model: Users,
        attributes: ["id", "email", "role"],
      },
    });

    res.status(200).json({
      message: "Profile updated successfully!",
      updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// Update the 'isVerified' field to true for a specific profile
const verifyProfile = async (req, res) => {
  try {
    // Fetch the profile by ID
    const profile = await Profile.findByPk(req.params.id, {
      include: [
        {
          model: Users,
          attributes: ["email"], // Include only the email field from the User model
        },
      ],
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Extract the user's email from the profile
    const userEmail = profile.user?.email;
    if (!userEmail) {
      return res
        .status(404)
        .json({ message: "User email not found for this profile" });
    }

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sujannewar7@gmail.com",
        pass: "kmum pyze yxsi tzml", // Use an app password for Gmail.
      },
    });

    // Mail options
    const mailOptions = {
      from: "sujannewar7@gmail.com", // Sender email
      to: userEmail, // Recipient email
      subject: "Message from Admin", // Email subject
      text: "Your Profile has been verified. You can now add services from the dashboard!", // Plain text body
    };

    // // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Update the 'isVerified' field to true
    await profile.update({ isVerified: true });

    // Optionally, return the updated profile data along with a success message
    res.status(200).json({
      message: "Profile verified successfully and email sent to the user!",
      updatedProfile: profile,
    });
  } catch (error) {
    console.error("Error verifying profile:", error);
    res
      .status(500)
      .json({ message: "Error verifying profile", error: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const profile = await Users.findAll({
      include: {
        model: Profile, // Include associated user data
      },
    });

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res
      .status(500)
      .json({ message: "Error retrieving profile", error: error.message });
  }
};

module.exports = {
  getProfileByUserId,
  updateProfile,
  verifyProfile,
  getAllUser,
  getProfileByUserIdAdmin,
};
