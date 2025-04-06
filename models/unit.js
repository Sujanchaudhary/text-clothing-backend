module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define("Unit", {
    name: DataTypes.STRING, // pcs, pair, set
  });

  return Unit;
};
