var models  = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
        res.render('index', {
            title: "Library Manager"
    });
});

module.exports = router;
