"use strict";

module.exports = function(sequelize, DataTypes) {
    const Book = sequelize.define("Book", {
        id: DataTypes.INTEGER,
        title: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Title is required"
                }
            }
        },
        author: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Author is required"
                }
            }
        },
        genre: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Genre is required"
                }
            }
        },
        first_published: {
            type: DataTypes.INTEGER,
            /*validate: {
                isNumeric: {
                    msg: "The year must be a number"
                },
            isBefore: {
                args: '2018',
                msg: "Book must be published this year or earlier"
            },
                len: {
                    args: [4, 4],
                    msg: "Years need to be written like 2017"
                }
            }*/
        }
    });

    Book.associate = function(models) {
        Book.hasOne(models.Loan, { foreignKey: "book_id" });
    };

    return Book;
};
