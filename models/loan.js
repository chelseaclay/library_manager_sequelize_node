"use strict";

module.exports = function(sequelize, DataTypes) {
    const Loan = sequelize.define("Loan", {
        id: DataTypes.INTEGER,
        book_id: DataTypes.INTEGER,
        patron_id: DataTypes.INTEGER,
        loaned_on: DataTypes.INTEGER,
        return_by: DataTypes.DATE,
        returned_on: DataTypes.DATE,
    });

    Loan.associate = function(models) {
        Loan.belongsTo(models.Book, { foreignKey: "book_id" });
        Loan.belongsTo(models.Patron, { foreignKey: "patron_id" });
    };

    return Loan;
};