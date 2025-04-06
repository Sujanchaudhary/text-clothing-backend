module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define("Expense", {
    title: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    description: DataTypes.STRING,
    date: DataTypes.DATE,
  });

  return Expense;
};
