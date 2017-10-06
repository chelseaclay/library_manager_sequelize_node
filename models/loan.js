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
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: 'Loan date is required.'
                }
            }
        },
        return_by: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: 'return date is required.'
                }
            }
        },
        returned_on: DataTypes.INTEGER,
    });

    Loan.associate = function(models) {
        Loan.belongsTo(models.Book, { foreignKey: "book_id" });
        Loan.belongsTo(models.Patron, { foreignKey: "patron_id" });
    };

    return Loan;
};