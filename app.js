const express = require('express');
const mysql = require('mysql');
const exphbs = require('express-handlebars');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

//Static files
app.use(express.static('public'));

//Templating Engine with handlebars
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

//Create db connection for heroku
const db = mysql.createConnection(process.env.JAWSDB_URL);

const port = process.env.PORT || 3000;

const publicDirectory = path.join(__dirname, './public/');
app.use(express.static(publicDirectory));

//Parsing middleware
app.use(express.urlencoded({ extended: false }));

//Parse JSON
app.use(express.json());

//Connect to database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to DB');
});

app.listen(port, () => {
    console.log(`Server started on Port ${port}`)
});

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/login', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/register', require('./routes/pages'));

app.route('/login/:user/:pass')
    .get(function (req, res, err) {
        var pword;
        if (err) {
            console.log(err);
        }
        const { user, pass } = req.params;
        console.log(user, pass)
        //Promise to get matching username from mySQL then compare passwords with bcrypt
        const dbPromise = new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE user_name = '" + user + "'", (err, result) => {
                if (err) {
                    console.log(err)
                    reject();
                }
                if (result.length == 0) {
                    console.log('This user does not exist in DB');
                    reject();
                }
                if (result.length > 0) {
                    console.log('This user exists in DB');
                    pword = result[0].user_hash;
                    resolve(pword);
                }
            })
        });
        dbPromise
            .then(() => {
                bcrypt.compare(pass, pword).then(function (result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result == true) {
                        console.log('Passwords are a match')
                        //res.redirect('/database');
                        res.send("Login Successful!");
                    } else {
                        console.log('Passwords do not match')
                        res.send("Incorrect Password!");
                    }
                })
            }).catch(() => {
                console.error('Something went wrong');
                res.send("This username does not exist!")
            })
    });

app.route('/index/:admin/:teamName')
    .post(function (req, res, err) {
        if(err){
            console.log(err)
        }
        const {admin, teamName} = req.body;
        console.log(admin, teamName)
        res.send(String(admin, teamName))
})