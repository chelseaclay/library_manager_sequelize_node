"use strict";

module.exports = function(sequelize, DataTypes) {
    const Loan = sequelize.define("Loan", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        book_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: "You must choose a book"
                }
            }
        },
        patron_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: "You must choose a patron"
                }
            }
        },
        loaned_on: {
            type: DataTypes.DATE,
            validate: {
                notEmpty: {
                    msg: "loaned on is required"
                }
            }
        },
        return_by: {
            type: DataTypes.DATE,
            validate: {
                notEmpty: {
                    msg: "returned on is required"
                }
            }
        },
        returned_on: DataTypes.DATE,
    });

    Loan.associate = function(models) {
        Loan.belongsTo(models.Book, { foreignKey: "book_id" });
        Loan.belongsTo(models.Patron, { foreignKey: "patron_id" });
    };

    return Loan;
};