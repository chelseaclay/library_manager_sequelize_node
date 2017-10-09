"use strict";
const express = require('express');
const router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;
const amountToShow = 5;
let pages = [];

function getPagination(list) {
    pages = [];
    let numPages = Math.ceil(list.length / amountToShow);
    for (let i = 1; i <= numPages; i += 1) {
        pages.push(i);
    }
}

/* GET all loans */
router.get('/', function (req, res) {
    Loan.findAll().then((loan) => {
        getPagination(loan);
    }).then(() => {
        Loan.findAll({
            include: [
                {model: Patron},
                {model: Book}
            ],
            limit: amountToShow,
            offset: amountToShow * (parseInt(req.query.page) - 1)
        }).then((loan) => {
            res.render('all_loans', {
                loans: loan,
                heading: 'Loans',
                currentPage: req.query.page,
                pages: pages
            });
        });
    });
});
/* GET checked loans */
router.get('/checked_loans', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        where: {
            returned_on: {
                $eq: null
            }
        }
    }).then((loan) => {
        getPagination(loan);
    }).then(() => {
        Loan.findAll({
            include: [
                {model: Patron},
                {model: Book}
            ],
            where: {
                returned_on: {
                    $eq: null
                }
            },
            limit: amountToShow,
            offset: amountToShow * (parseInt(req.query.page) - 1)
        }).then((loan) => {
            res.render('all_loans', {
                loans: loan,
                heading: 'Checked Loans',
                currentPage: req.query.page,
                pages: pages
            });
        });
    });
});

/* GET overdue loans */
router.get('/overdue_loans', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        where: {
            returned_on: null,
            return_by: {
                $lte: moment().format("YYYY-MM-DD")
            }
        },
        limit: amountToShow,
        offset: amountToShow * (parseInt(req.query.page) - 1)
    }).then((loan) => {
        getPagination(loan);
    }).then(() => {
        Loan.findAll({
            include: [
                {model: Patron},
                {model: Book}
            ],
            where: {
                returned_on: null,
                return_by: {
                    $lte: moment().format("YYYY-MM-DD")
                }
            }
        }).then((loan) => {
            res.render('all_loans', {
                loans: loan,
                heading: 'Overdue Loans',
                currentPage: req.query.page,
                pages: pages
            });
        });
    });
});

/* GET all loans ordered by Book Title */
router.get('/book', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        order: [[Book, 'title']]
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Loans'
        });
    });
});
/* GET all loans ordered by Patron */
router.get('/patron', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        order: [[Patron, 'first_name']]
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Loans'
        });
    });
});
/* GET all loans ordered by Loaned on */
router.get('/loanedOn', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        order: [['loaned_on']]
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Loans'
        });
    });
});
/* GET all loans ordered by Return by */
router.get('/returnBy', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        order: [['return_by']]
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Loans'
        });
    });
});
/* GET all loans ordered by Returned on */
router.get('/returned', function (req, res) {
    Loan.findAll({
        include: [
            {model: Patron},
            {model: Book}
        ],
        order: [['returned_on']]
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Loans'
        });
    });
});


// GET new loan form
router.get('/new_loan', function (req, res, next) {
    const getBooks = Book.findAll();
    const getPatrons = Patron.findAll();
    const getLoans = Loan.findAll({
        attribute: ['book_id'],
        where: {
            returned_on: null
        }
    });

    //once all info has been got sort books to only show ones that haven't been loaned
    Promise.all([getBooks, getLoans, getPatrons])
        .then(results => {
            let today = moment().format("YYYY-MM-DD");
            let returnBy = moment(new Date().setDate(new Date().getDate() + 7)).format("YYYY-MM-DD");
            let loanedBooks = [];
            let availableBooks = [];
            let books = results[0];
            let loans = results[1];
            let allPatrons = results[2];
            loans.forEach(function (loan) {
                loanedBooks.push(loan.book_id)
            });
            books.forEach(function (book) {
                if (loanedBooks.indexOf(book.id) < 0) {
                    availableBooks.push(book);
                }
            });

            res.render('new_loan', {
                loans: loans,
                books: availableBooks,
                patrons: allPatrons,
                loaned_on: today,
                return_by: returnBy,
                heading: 'New Loan'
            });
        });
});
// ADD new loan to the database
router.post('/new_loan', function (req, res, next) {

    Loan.create(req.body)
        .then(() => {
            res.redirect('/loans');
        }).catch((error) => {
        const getBooks = Book.findAll();
        const getPatrons = Patron.findAll();
        const getLoans = Loan.findAll({
            attribute: ['book_id'],
            where: {
                returned_on: null
            }
        });
        Promise.all([getBooks, getLoans, getPatrons])
            .then(results => {
                if (error.name) {
                    let today = moment().format("YYYY-MM-DD");
                    let returnBy = moment(new Date().setDate(new Date().getDate() + 7)).format("YYYY-MM-DD");
                    let loanedBooks = [];
                    let availableBooks = [];
                    let books = results[0];
                    let loans = results[1];
                    let allPatrons = results[2];
                    loans.forEach(function (loan) {
                        loanedBooks.push(loan.book_id)
                    });
                    books.forEach(function (book) {
                        if (loanedBooks.indexOf(book.id) < 0) {
                            availableBooks.push(book);
                        }
                    });
                    res.render('new_loan', {
                        loans: loans,
                        books: availableBooks,
                        patrons: allPatrons,
                        loaned_on: today,
                        return_by: returnBy,
                        heading: 'There seems to have been an error',
                        errors: error.errors
                    });
                } else {
                    res.status(500).send(error);
                }


            })
    });
});

module.exports = router;