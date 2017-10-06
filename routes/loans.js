"use strict";
var express = require('express');
var router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

/* GET all loans */
router.get('/', function(req, res) {
    Loan.findAll({
        include: [
            { model: Patron },
            { model: Book }
        ]
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Loans'
        });
    });
});
/* GET checked loans */
router.get('/checked_loans', function(req, res) {
    Loan.findAll({
        include: [
            { model: Patron },
            { model: Book }
        ],
        where: {
            returned_on: {
                $eq: null
            }
        }
    }).then((loan) => {
        res.render('all_loans', {
            loans: loan,
            heading: 'Checked Loans'
        });
    });
});


/* GET overdue loans */
router.get('/overdue_loans', function(req, res) {
    Loan.findAll({
        include: [
            { model: Patron },
            { model: Book }
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
            heading: 'Overdue Loans'
        });
    });
});
// GET new loan form
router.get('/new_loan', function(req, res, next) {
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
            let availableBooks =[];
            let books = results[0];
            let loans = results[1];
            let allPatrons = results[2];
            loans.forEach(function(loan){
                loanedBooks.push(loan.book_id)
            });
            books.forEach(function(book) {
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
router.post('/new_loan', function(req, res, next) {
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
        }).then(results => {
        Loan.create(req.body)
            .then(() => {
                res.redirect('/loans');
            })
            .catch((error, loans, availableBooks, allPatrons, today, returnBy) =>{
                if (error.name === 'SequelizeValidationError') {
                    res.render('new_loan', {
                        errors: error.errors,
                        loans: loans,
                        books: availableBooks,
                        patrons: allPatrons,
                        loaned_on: today,
                        return_by: returnBy,
                        heading: "big problems"
                    });
                }
            })
            .catch(function (error) {
                console.log('Error: ' + error);
                res.status(500).send(error);
            });
    });
});

module.exports = router;