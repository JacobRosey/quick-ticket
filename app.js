const express = require('express');
const mysql = require('mysql');
const exphbs = require('express-handlebars');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { isBuffer } = require('util');
const { resolve } = require('path/posix');

const app = express();

//Static files
app.use(express.static('public'));

//Templating Engine with handlebars
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

//Create db connection for heroku
const db = mysql.createConnection(process.env.JAWSDB_URL, { multipleStatements: true });

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

app.route('/index/:admin/:team')
    .post(function (req, res, err) {
        if (err) {
            console.log(err)
        }
        const { admin, team } = req.body;

        //Promise to get matching user from mySQL then create new admin record
        const dbPromise = new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE user_name = '" + admin + "'", (err, result) => {
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
                    userID = result[0].user_id;
                    resolve(userID);
                }
            })
        });
        dbPromise.then(() => {

            const teamCode = crypto.randomBytes(5).toString('hex');
            //Only doing this ugly ass nested structure because the commented code below produced 
            //an SQL parse error; couldn't find an answer on Google
            db.query(`INSERT INTO Teams (team_name, team_code) VALUES ('` + team + `', '` + teamCode + `');`, (err, result) => {
                if (err) {
                    console.log(err)
                    res.send('Team creation failed');
                } else {
                    db.query('SET @last_id = (SELECT LAST_INSERT_ID()); ', (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send('Team creation failed');
                        } else {//Could use an SQL trigger instead but not sure if that would be any better
                            db.query(`INSERT INTO Members (user_id, team_id) VALUES (` + userID + `, @last_id);`, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.send('Team creation failed')
                                } else {
                                    db.query(`INSERT INTO Admins (user_id, team_id) VALUES (` + userID + `, @last_id);`, (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.send('Team creation failed');
                                        }
                                        else {
                                            console.log(result)
                                            res.send('Team created')
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
            /*
            db.query(`
            INSERT INTO Teams (team_name, team_code) 
            VALUES ('`+ team + `', '` + teamCode + `'); 
            SET @last_id = (SELECT LAST_INSERT_ID()); 
            INSERT INTO Admins (user_id, team_id) VALUES 
            (`+userID+`, @last_id);
            `, (err, result) => {
                if(err){
                    console.log(err)
                } else {console.log(result)}
            })
            console.log(admin, team, teamCode)
            res.send("SUCCESS!")*/
        })
    })

app.route('/index2/:user/:code')
    .post(function (req, res, err) {
        if(err){
            console.log(err)
        }
        const {user, code} = req.body;

        console.log(user)

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
                    userID = result[0].user_id;
                    resolve(userID);
                }
            })
        });
        dbPromise.then(() => {
            console.log(userID)
            db.query('SELECT * FROM Teams WHERE team_code = '+code+' ', (err, result) => {
                if(err) {
                    console.log(err);
                    reject();
                }
                if(result.length == 0 ) {
                    console.log('Invalid code!');
                    reject();
                }
                if(result.length > 0) {
                    console.log('Found the team');
                    teamID = result[0].team_id;
                    teamName = result[0].team_name;
                    db.query('INSERT INTO Members (team_id, user_id) VALUES ('+team_id+', '+user_id+');', (err, result) => {
                        if(err) {
                            console.log(err);
                            reject();
                        }
                        res.send(teamName);
                    })
                }
            })
        })
    })