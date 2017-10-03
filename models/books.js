"use strict";

module.exports = function(sequelize, DataTypes) {
    const Books = sequelize.define("Books", {
        id: DataTypes.INTEGER,
        title: DataTypes.STRING,
        author: DataTypes.STRING,
        genre: DataTypes.STRING,
        first_published: DataTypes.INTEGER
    });

    Books.associate = function(models) {
        Books.hasMany(models.Task);
    };

    return Books;
};
