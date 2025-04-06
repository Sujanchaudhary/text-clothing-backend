module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    name: DataTypes.STRING,
    sku: DataTypes.STRING, // for barcode
    color: DataTypes.STRING,
    size: DataTypes.STRING,
    cost_price: DataTypes.FLOAT, // Purchase cost
    mrp: DataTypes.FLOAT, // Suggested price (optional)
    image: DataTypes.STRING,
  });

  return Product;
};
