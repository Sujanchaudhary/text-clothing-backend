module.exports = (sequelize, Sequelize) => {
  const UserProfile = sequelize.define("UserProfile", {
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },

    // Contact Information
    phone: {
      type: Sequelize.STRING,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },

    // Address Management
    primaryAddress: {
      type: Sequelize.STRING,
    },
    secondaryAddress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING,
    },
    zipCode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    country: {
      type: Sequelize.STRING,
    },

    // Additional Information
    profilePicture: {
      type: Sequelize.STRING,
      defaultValue:
        "https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z2lybHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60",
    },

    // Verification & Account Status
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return UserProfile;
};
