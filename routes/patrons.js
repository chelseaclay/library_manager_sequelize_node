var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

/* GET all patrons */
router.get('/', function(req, res) {
    Patron.findAll().then((patron) => {
        res.render('all_patrons', {
            patrons: patron,
            title: 'All Patrons'
        });
    });
});

module.exports = router;