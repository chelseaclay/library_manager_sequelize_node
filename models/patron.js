"use strict";

module.exports = function(sequelize, DataTypes) {
    const Patron = sequelize.define("Patron", {
        id: DataTypes.INTEGER,
        first_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "You must enter a first name"
                }
            }
        },
        last_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "You must enter a last name"
                }
            }
        },
        address: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "You must enter an address"
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "You must enter an email"
                },
                isEmail: {
                    msg: "You must enter a correct email"
                }
            }
        },
        library_id: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "You must enter a library number"
                }
            }
        },
        zip_code: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: "You must enter a zip code"
                },
                isNumeric: {
                    msg: "zip code must be a number"
                }
            }
        },
    });

    Patron.associate = function(models) {
        Patron.hasMany(models.Loan, { foreignKey: "patron_id" });
    };

    return Patron;
};
