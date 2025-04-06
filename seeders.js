const { Users, Profile } = require("./models");
const bcrypt = require("bcryptjs");

const seedUsers = async () => {
  await Users.sync(); // Ensure the table exists before seeding
  const hashedPassword = await bcrypt.hash("password", 10);

  const users = [
    {
      name: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
    {
      name: "Sujan User",
      email: "user@gmail.com",
      password: hashedPassword,
      role: "member",
    },
  ];

  for (const user of users) {
    const [instance, created] = await Users.findOrCreate({
      where: { email: user.email },
      defaults: user,
    });
    if (created) {
      await Profile.create({
        userId: instance.id, // Associate profile with the created user
      });
    } else {
      console.log(`User ${user.email} already exists.`);
    }
  }
};

module.exports = { seedUsers };
