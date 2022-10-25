//const authController = require('../controllers/auth');

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/home', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/newticket', (req, res) => {
    res.render('newticket');
});

router.get('/mytickets', (req, res) => {
    res.render('mytickets');
});

router.get('/opentickets', (req, res) => {
    res.render('opentickets');
});

router.get('/closedtickets', (req, res) => {
    res.render('closedtickets')
})

router.get('/performance', (req, res) => {
    res.render('performance');
});

router.get('/team', (req, res) => {
    res.render('team');
});

module.exports = router;