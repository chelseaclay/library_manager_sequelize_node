var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;
const amountToShow = 10;
let pages = [];

function getPagination(list) {
    pages = [];
    let numPages = Math.ceil(list.length / amountToShow);
    for (let i = 1; i <= numPages; i += 1) {
        pages.push(i);
    }
}

/* GET all patrons */
router.get('/', (req, res) =>{
    Patron.findAll().then((patron) => {
        res.render('all_patrons', {
            patrons: patron,
            heading: 'All Patrons'
        });
    });
});

/* ADD new patron form */
router.get('/new_patron', (req, res) =>{
    res.render('new_patron', {
        heading: 'New Patron',
    });
});
/* ADD new patron - checks for errors carries over values to new rendered page */
router.post('/new_patron', (req, res, next) =>{
    Patron.create(req.body)
        .then(() =>{
            res.redirect("../patrons");
        }).catch((error) => {
        if(error.name === "SequelizeValidationError") {
            res.render("new_patron", {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                address: req.body.address,
                email: req.body.email,
                library_id: req.body.library_id,
                zip_code: req.body.zip_code,
                errors: error.errors,
                heading: "New Patron Missing Info"
            })
        }else if(error.name === "SequelizeUniqueConstraintError"){
            res.render("new_patron", {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                address: req.body.address,
                email: req.body.email,
                library_id: req.body.library_id,
                zip_code: req.body.zip_code,
                errors: error.errors,
                heading: "That Patron seems to be already in our system"
            })
        } else {
            throw error;
        }

    }).catch((error) => {
        res.status(500).send(error);
    })

});

/* GET details of patron */
router.get('/:id', (req, res) => {
    Loan.findAll({
        where: [
            {patron_id: req.params.id}
        ],
        include: [{
            model: Patron
        },
            {
                model: Book
            }
        ],
    }).then((loan) => {
        getPagination(loan);
    }).then(() => {
        const getPatron = Patron.findOne({
            where: [
                {id: req.params.id}
            ]
        });

        const getLoans = Loan.findAll({
            where: [
                {patron_id: req.params.id}
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

        Promise.all([getPatron, getLoans])
            .then(results => {
                res.render('patron_detail', {
                    patron: results[0],
                    loans: results[1],
                    currentPage: req.query.page,
                    pages: pages
                });
            });
    });
});

/* UPDATE details of patrons */
router.post('/:id/update', (req, res) =>{
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
        },{
            model: Book
        }],
    });

    Promise.all([getPatron, getLoans]).then(results => {
        Patron.update(req.body, {
            where: [{id: req.params.id}]
        }).then(() => {
            res.redirect('/patrons');
        }).catch(function(error){
            if(error.name === "SequelizeValidationError") {
                res.render('patron_detail', {
                    patron: results[0],
                    loans: results[1],
                    errors: error.errors
                });
            } else {
                res.status(500).send(error);
            }
        })

    });
});



module.exports = router;