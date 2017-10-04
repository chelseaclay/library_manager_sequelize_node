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
            title: 'Loans'
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
            title: 'Checked Loans'
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
            title: 'Overdue Loans'
        });
    });
});

module.exports = router;