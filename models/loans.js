"use strict";

module.exports = function(sequelize, DataTypes) {
    const Loans = sequelize.define("Loans", {
        id: DataTypes.INTEGER,
        book_id: DataTypes.INTEGER,
        return_by: DataTypes.DATE,
        returned_on: DataTypes.DATE,
    });

    Loans.associate = function(models) {
        Loans.hasMany(models.Task);
    };

    return Loans;
};