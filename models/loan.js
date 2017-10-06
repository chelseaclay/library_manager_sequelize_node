"use strict";

module.exports = function(sequelize, DataTypes) {
    const Loan = sequelize.define("Loan", {
        id: DataTypes.INTEGER,
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
                    msg: 'Loan date is required.'
                },
                isDate: {
                    msg: 'Loan date must be a date.'
                }
            }
        },
        return_by: {
            type: DataTypes.DATE,
            validate: {
                notEmpty: {
                    msg: 'return date is required.'
                },
                isDate: {
                    msg: 'return date must be a date.'
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