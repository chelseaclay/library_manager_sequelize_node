"use strict";

module.exports = function(sequelize, DataTypes) {
    const Patron = sequelize.define("Patron", {
        id: DataTypes.INTEGER,
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        address: DataTypes.STRING,
        email: DataTypes.STRING,
        library_id: DataTypes.STRING,
        zip_code: DataTypes.INTEGER
    });

    Patron.associate = function(models) {
        Patron.hasMany(models.Loan, { foreignKey: "patron_id" });
    };

    return Patron;
};
