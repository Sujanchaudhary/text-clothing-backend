module.exports = (sequelize, DataTypes) => {
    const Sale = sequelize.define("Sale", {
      total: DataTypes.FLOAT,        // Total after item-wise prices
      payment_type: DataTypes.STRING, // cash, phonepay, etc.
    });

  
    return Sale;
  };
  