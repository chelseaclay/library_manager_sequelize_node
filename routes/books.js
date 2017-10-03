var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* GET all books */
router.get('/', function(req, res) {
    Book.findAll({ order: [["first_published", "DESC"]] }).then((book) => {
        res.render('all_books', {
            books: book,
            title: 'Books'
        });
    });
});

module.exports = router;