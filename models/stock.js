module.exports = (sequelize, DataTypes) => {
    const StockHistory = sequelize.define("StockHistory", {
      type: DataTypes.ENUM("in", "out", "adjust"), // stock added, removed, corrected
      quantity: DataTypes.INTEGER,
      reason: DataTypes.STRING, // optional: "purchase", "sale", "correction", etc.
    });
  

  
    return StockHistory;
  };
  