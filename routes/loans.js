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
router.get('/new_loan', (req, res) =>{
    const getBook = Book.findAll({
        include: [
            { model: Loan }
        ]

    });
    const getPatrons = Patron.findAll();

    Promise.all([getBook, getPatrons])
        .then(results => {
            res.render('new_loan', {
                books: results[0],
                patrons: results[1],
                heading: 'New Loan',
                loaned_on: moment(new Date()).format("YYYY-MM-DD"),
                return_by: moment(new Date().setDate(new Date().getDate() + 7)).format("YYYY-MM-DD"),
            });
        });

});
/* ADD new loan - checks for errors carries over values to new rendered page */
router.post('/new_loan', (req, res, next) =>{
    Loan.create(req.body)
        .then((loan) =>{
            res.redirect("../loans");
        }).catch((error) => {
        if(error.name === "SequelizeValidationError") {
            res.render("new_loan", {
                book_id: req.body.book_id,
                title: req.body.title,
                patron_id: req.body.patron_id,
                loaned_on: req.body.loaned_on,
                return_by: req.body.return_by,
                errors: error.errors,
                heading: "New Loan Missing Info"
            })
        }else if(error.name === "SequelizeUniqueConstraintError"){
            res.render("new_loan", {
                book_id: req.body.book_id,
                patron_id: req.body.patron_id,
                loaned_on: req.body.loaned_on,
                return_by: req.body.return_by,
                errors: error.errors,
                heading: "That Loan seems to be already in our system"
            })
        } else {
            throw error;
        }

    }).catch((error) => {
        res.status(500).send(error);
    })

});


module.exports = router;