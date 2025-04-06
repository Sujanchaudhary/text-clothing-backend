module.exports = (sequelize, DataTypes) => {
  const SaleItem = sequelize.define("SaleItem", {
    quantity: DataTypes.INTEGER,
    selling_price: DataTypes.FLOAT, // Final price per unit after bargaining
    total: DataTypes.FLOAT, // quantity * selling_price
  });

  return SaleItem;
};
