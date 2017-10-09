"use strict";
const express = require('express');
const router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;
const functions = require('../javascripts/functions');
let amountToShow = 10;
let pages = [];

/* GET all books */
router.get('/', function (req, res) {
        Book.findAll().then((book) => {
            pages = functions.getPagination(book, pages, amountToShow);
        }).then(() => {
            Book.findAll({
                order: [["first_published", "DESC"]],
                limit: amountToShow,
                offset: amountToShow * (parseInt(req.query.page) - 1)
            })
                .then((book) => {
                    res.render('all_books', {
                        books: book,
                        heading: 'Books',
                        currentPage: req.query.page,
                        pages: pages
                    });
                });    })  ;



});
/* GET all books */
router.get('/search', function (req, res) {
        Book.findAll({
            where: {
                $or: [
                    {
                        title: { $like: '%' + req.query.search + '%' }
                    },
                    {
                        author: { $like: '%' + req.query.search + '%' }
                    },
                    {
                        genre: { $like: '%' + req.query.search + '%' }
                    }
                ]
            }
        }).then((book) => {
            pages = functions.getPagination(book, pages, amountToShow);
        }).then(() => {
            Book.findAll({
                order: [["first_published", "DESC"]],
                where: {
                    $or: [
                        {
                            title: { $like: '%' + req.query.search + '%' }
                        },
                        {
                            author: { $like: '%' + req.query.search + '%' }
                        },
                        {
                            genre: { $like: '%' + req.query.search + '%' }
                        }
                    ]
                },
                limit: amountToShow,
                offset: amountToShow * (parseInt(req.query.page) - 1)
            }).then((book) => {
                    res.render('all_books', {
                        books: book,
                        heading: 'All Books for search of ' + req.query.search,
                        currentPage: req.query.page,
                        pages: pages
                    });
                })
        });
});


/* GET overdue books */
router.get('/overdue_books', function (req, res) {
    Book.findAll({
        include: [
            {
                model: Loan,
                where: {
                    returned_on: null,
                    return_by: {
                        $lte: moment().format("YYYY-MM-DD")
                    }
                }
            }
        ]
    }).then((book) => {
        pages = functions.getPagination(book, pages, amountToShow);
    }).then(() => {
        Book.findAll(
            {
                include: [
                    {
                        model: Loan,
                        where: {
                            returned_on: null,
                            return_by: {
                                $lte: moment().format("YYYY-MM-DD")
                            }
                        }
                    }
                ],
                limit: amountToShow,
                offset: amountToShow * (parseInt(req.query.page) - 1)
            })
            .then((book) => {
                res.render('all_books', {
                    books: book,
                    heading: 'Overdue Books',
                    pages: pages,
                    currentPage: req.query.page,
                });
            });
    });
});

/* GET checked out books */
router.get('/checked_books', function (req, res) {
    Book.findAll({
        include: [
            {
                model: Loan,
                where: {
                    returned_on: {
                        $eq: null
                    }
                }
            }
        ]
    }).then((book) => {
        pages = functions.getPagination(book, pages, amountToShow);
    }).then(() => {
        Book.findAll({
            include: [
                {
                    model: Loan,
                    where: {
                        returned_on: {
                            $eq: null
                        }
                    }
                }
            ],
            limit: amountToShow,
            offset: amountToShow * (parseInt(req.query.page) - 1)
        })
            .then((book) => {
                res.render('all_books', {
                    books: book,
                    heading: 'Checked Out Books',
                    pages: pages,
                    currentPage: req.query.page,
                });
            });
    });
});

/* GET add new book form */
router.get('/new_book', (req, res) => {
    res.render('new_book', {
        heading: 'New Book',
    });
});

/* ADD new book - checks for errors carries over values to new rendered page */
router.post('/new_book', (req, res, next) => {
    Book.create(req.body)
        .then(() => {
            res.redirect("../books");
        }).catch((error) => {
        if (error.name === "SequelizeValidationError") {
            res.render("new_book", {
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                first_published: req.body.first_published,
                errors: error.errors,
                heading: "New Book Missing Info"
            })
        } else if (error.name === "SequelizeUniqueConstraintError") {
            res.render("new_book", {
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                first_published: req.body.first_published,
                errors: error.errors,
                heading: "That Book seems to be already in our system"
            })
        } else {
            throw error;
        }

    }).catch((error) => {
        res.status(500).send(error);
        console.log(error)
    })

});
/* GET details of book */
router.get('/:id', (req, res) => {
    Loan.findAll({
        where: [
            {book_id: req.params.id}
        ],
        include: [{
            model: Patron
        },
            {
                model: Book
            }
        ]
    }).then((loan) => {
        pages = functions.getPagination(loan, pages, amountToShow);
    }).then(() => {
        const getBook = Book.findOne({
            where: [
                {id: req.params.id}
            ]
        });

        const getLoans = Loan.findAll({
            where: [
                {book_id: req.params.id}
            ],
            include: [{
                model: Patron
            },
                {
                    model: Book
                }
            ],
            limit: amountToShow,
            offset: amountToShow * (parseInt(req.query.page) - 1)
        });

        Promise.all([getBook, getLoans])
            .then(results => {
                res.render('book_detail', {
                    book: results[0],
                    loans: results[1],
                    currentPage: req.query.page,
                    pages: pages
                });
            });
    });
});

/* UPDATE details of book */
router.post('/:id/update', (req, res) => {
    const getBook = Book.findOne({
        where: [
            {id: req.params.id}
        ]
    });
    const getLoans = Loan.findAll({
        where: [
            {book_id: req.params.id}
        ],
        include: [{
            model: Patron
        }],
    });

    Promise.all([getBook, getLoans]).then(results => {
        Book.update(req.body, {
            where: [{id: req.params.id}]
        }).then(() => {
            res.redirect('/books');
        }).catch((error) => {
            if (error.name === "SequelizeValidationError") {
                res.render('book_detail', {
                    book: results[0],
                    loans: results[1],
                    errors: error.errors
                });
            } else {
                res.status(500).send(error);
            }
        })

    });
});
// Get return of book details
router.get('/:id/return', (req, res) => {
    Loan.findOne({
        where: [
            {book_id: req.params.id}
        ],
        include: [
            {model: Patron},
            {model: Book}
        ]
    }).then((loan) => {
        res.render('return_book', {
            loan: loan,
            returned_on: moment().format("YYYY-MM-DD"),
            heading: "Return Book"
        });
    });
});

/* UPDATE returned book if date is added and valid */
router.post('/:id/return', (req, res, next) => {
    let errors = [];
    let returned_on = req.body.returned_on;
    let today = moment().format("YYYY-MM-DD");
    if (!returned_on) {
        errors.push('You need to add a date. How about today?')
    } else if (returned_on > today) {
        errors.push('That\'s not a valid date. How about today?');
    }
    if (errors.length > 0) {
        Loan.findOne({
            where: [
                {book_id: req.params.id}
            ],
            include: [
                {model: Patron},
                {model: Book}
            ]
        }).then((loan) => {
            res.render('return_book', {
                loan: loan,
                returned_on: today,
                heading: "Return Book",
                errors: errors
            });
        });
    } else {
        Loan.update(req.body, {where: [{book_id: req.params.id}]})
            .then(() => {
                res.redirect('/loans')
            })
    }


});

module.exports = router;