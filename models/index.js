const dbConfig = require("./../config/dbConfig.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  logging: false,
  port: dbConfig.port,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Existing models
db.Users = require("./../models/user.js")(sequelize, Sequelize);
db.Profile = require("./../models/profile.js")(sequelize, Sequelize);

// New models
db.Product = require("./../models/product.js")(sequelize, Sequelize);
db.Inventory = require("./../models/inventory.js")(sequelize, Sequelize);
db.Category = require("./../models/category.js")(sequelize, Sequelize);
db.Unit = require("./../models/unit.js")(sequelize, Sequelize);
db.Sale = require("./../models/sale.js")(sequelize, Sequelize);
db.SaleItem = require("./../models/saleItem.js")(sequelize, Sequelize);
db.Expense = require("./../models/expense.js")(sequelize, Sequelize);
db.StockHistory = require("./../models/stock.js")(sequelize, Sequelize);

// Model Associations

// User
db.Users.hasOne(db.Profile);
db.Profile.belongsTo(db.Users);
db.Users.hasMany(db.Sale);
db.Users.hasMany(db.Expense);
db.Users.hasMany(db.StockHistory); // New

// Product
db.Product.belongsTo(db.Category);
db.Category.hasMany(db.Product);

db.Product.hasOne(db.Inventory);
db.Inventory.belongsTo(db.Product);

db.Inventory.belongsTo(db.Unit);
db.Unit.hasMany(db.Inventory);

db.Product.hasMany(db.SaleItem);
db.SaleItem.belongsTo(db.Product);

db.Product.hasMany(db.StockHistory); // New
db.StockHistory.belongsTo(db.Product); // New

// Sale & Sale Items
db.Sale.hasMany(db.SaleItem, { as: "items" });
db.SaleItem.belongsTo(db.Sale);
db.Sale.belongsTo(db.Users);

// Expense
db.Expense.belongsTo(db.Users);

// Stock History
db.StockHistory.belongsTo(db.Users); // New

module.exports = db;
