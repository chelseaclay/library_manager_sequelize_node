var express = require('express');
var router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

/* GET all books */
router.get('/', function(req, res) {
    Book.findAll({ order: [["first_published", "DESC"]] }).then((book) => {
        res.render('all_books', {
            books: book,
            title: 'Books'
        });
    });
});

/* GET overdue books */
router.get('/overdue_books', function(req, res) {
    Book.findAll(
        { include: [
        { model: Loan,
            where: {
                returned_on: null,
                return_by: {
                $lte: moment().format("YYYY-MM-DD")
                }
            }
        }
    ]
    })
        .then((book) => {
        res.render('all_books', {
            books: book,
            title: 'Overdue Books'
        });
    });
});

/* GET checked out books */
router.get('/checked_books', function(req, res) {
    Book.findAll({ include: [
        { model: Loan,
            where: {
                returned_on: {
                    $eq: null
                }
            }
        }
    ]
    })
        .then((book) => {
        res.render('all_books', {
            books: book,
            title: 'Checked Out Books'
        });
    });
});

/* GET add new book form */
router.get('/new_book', (req, res) =>{
    res.render('new_book', {
                heading: 'New Books',
            });
});

/* add new book */
router.post('/new_book', (req, res, next) =>{
    Book.create(req.body)
        .then((res) =>{
            res.render('new_book',
                { book: Book.build(),
                    title: 'New Book'
                });
        })
        .catch((error) => {
            res.status(500).send(error);
        })

});
/* GET details of book */
router.get('/:id', (req, res) =>{
    Book.findOne({
        where: [
            { id: req.params.id}
        ]
    })
        .then((book) => {
            res.render('book_detail', {
                title: book.title,
                genre: book.genre,
                author: book.author,
                first_published: book.first_published
            });

        });
});


module.exports = router;