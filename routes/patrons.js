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

/* GET details of patron */
router.get('/:id', (req, res) =>{
    const getPatron = Patron.findOne({
        where: [
            { id: req.params.id }
        ]
    });

    const getLoans = Loan.findAll({
        where: [
            { patron_id: req.params.id }
        ],
        include: [{
            model: Patron
        },
            {
        model: Book}
        ],
    });

    Promise.all([getPatron, getLoans])
        .then(results => {
            res.render('patron_detail', {
                patron: results[0],
                loans: results[1],
            });
        });
});

module.exports = router;