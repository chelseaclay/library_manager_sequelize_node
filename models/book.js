"use strict";

module.exports = function(sequelize, DataTypes) {
    const Book = sequelize.define("Book", {
        id: DataTypes.INTEGER,
        title: DataTypes.STRING,
        author: DataTypes.STRING,
        genre: DataTypes.STRING,
        first_published: DataTypes.INTEGER
    });

    Book.associate = function(models) {
        Book.hasOne(models.Loan, { foreignKey: "book_id" });
        Book.hasOne(models.Patron, { foreignKey: "book_id" });
    };

    return Book;
};
