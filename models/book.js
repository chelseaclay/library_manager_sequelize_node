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
        // associations can be defined here
        //Books.hasOne(models.Loans, { foreignKey: "book_id" });
    };

    return Book;
};
