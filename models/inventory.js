module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define("Inventory", {
    quantity: DataTypes.INTEGER,
    alert_quantity: DataTypes.INTEGER,
  });

  return Inventory;
};
