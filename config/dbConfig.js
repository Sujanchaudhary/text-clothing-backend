
module.exports = {
  HOST: process.env.MYSQLHOST || "localhost",
  USER: process.env.MYSQLUSER || "root",
  PASSWORD: process.env.MYSQLPASSWORD || "",
  DB: process.env.MYSQL_DATABASE || "test-clothing",
  dialect: "mysql",
  port: process.env.MYSQLPORT || 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
