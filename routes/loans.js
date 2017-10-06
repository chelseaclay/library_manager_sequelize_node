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
/* GET new loan form */
router.get('/new_loan', function(req, res, next) {
    let loanedBooks = [];
    let availableBooks =[];

    const getBooks = Book.findAll();
    const getPatrons = Patron.findAll();
    const getLoans = Loan.findAll({
        where: {
            returned_on: null
        }
    });

    //once all info has been got sort books to only show ones that haven't been loaned
    Promise.all([getBooks, getLoans, getPatrons])
        .then(results => {
            let books = results[0];
            let loans = results[1];
            let allPatrons = results[2];
            loans.forEach(function(loan){
                loanedBooks.push(loan.book_id)
            });
            books.forEach(function(book) {
                if (loanedBooks.indexOf(book.id) === -1) {
                    availableBooks.push(book);
                    console.log(availableBooks.length)
                }
            });

            res.render('new_loan', {
                loans: loans,
                books: availableBooks,
                patrons: allPatrons,
                loaned_on: moment(new Date()).format("YYYY-MM-DD"),
                return_by: moment(new Date().setDate(new Date().getDate() + 7)).format("YYYY-MM-DD"),
                heading: 'New Loan'
            });
        });
});
/* ADD new loan to the database */
router.post('/new_loan', function(req, res, next) {
    Loan.create(req.body)
        .then(() =>{
            res.redirect('/loans');
        })
        .catch((error) =>{
            if (error.name === 'SequelizeValidationError') {
                res.render('new_loan', {
                    errors: error.errors,
                    heading: "New Loan Missing Info",
                    loaned_on: req.body.loaned_on,
                    return_by: req.body.return_by
                });
            }else if (error.name === 'SequelizeUniqueConstraintError') {
                res.render('new_loan', {
                    errors: error.errors,
                    heading: "That loan seems to be already in our system",
                    loaned_on: req.body.loaned_on,
                    return_by: req.body.return_by
                });
            }  else {
                throw error;
            }
        })
        .catch(function(error) {
            res.status(500).send(error);
        });
});


module.exports = router;