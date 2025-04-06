module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: Sequelize.DataTypes.ENUM("admin", "member"),
      defaultValue: "member",
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    passwordResetToken: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  return User;
};
