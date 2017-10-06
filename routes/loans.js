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
/* ADD new loan form */
/*router.get('/new_loan', (req, res) =>{
    const getBooks = Book.findAll();
    const getPatrons = Patron.findAll();
    Promise.all([getBooks, getPatrons])
        .then(results => {
            res.render('new_loan', {
                books: results[0],
                patrons: results[1],
                heading: 'New Loan',
                loaned_on: moment(new Date()).format("YYYY-MM-DD"),
                return_by: moment(new Date().setDate(new Date().getDate() + 7)).format("YYYY-MM-DD"),
            });
        });
});*/
/* ADD new loan - checks for errors carries over values to new rendered page */
router.get('/new_loan', function(req, res, next) {
    var allBooks = [];
    var allPatrons = [];
    var booksNotReturned = [];
    var availableBooks =[];

    Patron.findAll().then(function(patrons) {
        allPatrons = patrons;

        //Find all available books, all loaned books should be filtered
        Book.findAll({})
            .then(function(books) {
                allBooks = books;
                Loan.findAll({
                    attribute: ['book_id'],
                    where: {
                        returned_on: null
                    }
                }).then(function(loans){
                    loans.forEach(function(loan){
                        booksNotReturned.push(loan.book_id)
                    });
                    books.forEach(function(book) {
                        if (booksNotReturned.indexOf(book.id) < 0) {
                            availableBooks.push(book);
                        }
                    }, this);
                })
                    .then(function() {
                        res.render('new_loan', {
                            loan: Loan.build(),
                            books: availableBooks,
                            patrons: allPatrons,
                            loaned_on: moment(new Date()).format("YYYY-MM-DD"),
                            return_by: moment(new Date().setDate(new Date().getDate() + 7)).format("YYYY-MM-DD"),
                            heading: 'New Loan'
                        });
                    });
            });
    });
});
router.post('/new_loan', function(req, res, next) {
    // console.log(req.body);
    Loan
        .create(req.body)
        .then(function() {
            res.redirect('/loans');
        })
        .catch(function(error) {
            if (error.name === 'SequelizeValidationError') {
                res.render('new_loan', {
                    errors: error.errors,
                    heading: "New Book Missing Info",
                    loaned_on: req.body.loaned_on,
                    return_by: req.body.return_by
                    //path: '../loans/'
                });
            }else if (error.name === 'SequelizeUniqueConstraintError') {
                res.render('new_loan', {
                    errors: error.errors,
                    heading: "That Book seems to be already in our system",
                    loaned_on: req.body.loaned_on,
                    return_by: req.body.return_by

                    //path: '../loans/'
                });
            }  else {
                throw error;
            }
        })
        .catch(function(err) {
            console.log('Error: ' + err);
            res.status(500).send(err);
        });
});
/*router.post('/new_loan', (req, res, next) =>{
    const allBooks = [];
    const availableBooks = [];
    Book.findAll().then(books =>{
        allBooks = books;
    })
    Loan.create(req.body)
        .then((loan) =>{
            res.redirect("../loans");
        }).catch((error) => {



        const getPatrons = Patron.findAll();


        Promise.all([getBooks, getPatrons])
            .then(results => {
                if(error.name === "SequelizeValidationError") {
                    res.render("new_loan", {
                        books: results[0],
                        patrons: results[1],
                        errors: error.errors,
                        heading: "New Loan Missing Info",
                        book_id: req.body.book_id,
                        loaned_on: req.body.loaned_on,
                        return_by: req.body.return_by
                    })
                }else if(error.name === "SequelizeUniqueConstraintError"){
                    res.render("new_loan", {
                        books: results[0],
                        patrons: results[1],
                        errors: error.errors,
                        heading: "New Loan Missing Info 2",
                        loaned_on: req.body.loaned_on,
                        return_by: req.body.return_by
                    })
                } else {
                    res.status(500).send(error);
                }
            });




    }).catch((error) => {
        res.status(500).send(error);
    })

});*/


module.exports = router;