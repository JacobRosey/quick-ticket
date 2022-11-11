const express = require('express');
const mysql = require('mysql');
const exphbs = require('express-handlebars');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
                            res.send('Failed to get last inserted team id');
                        } else {//Could use an SQL trigger instead but not sure if that would be any better
                            db.query(`INSERT INTO Members (user_id, team_id) VALUES (` + userID + `, @last_id);`, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.send('Failed to insert you into members table')
                                } else {
                                    db.query(`INSERT INTO Admins (user_id, team_id) VALUES (` + userID + `, @last_id);`, (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.send('Failed to insert you into admin table');
                                        }
                                        else {
                                            //Get user who created the team, set is_admin to 1, aka "true"
                                            db.query("UPDATE Users SET is_admin = 1 WHERE user_id = '" + userID + "'", (err, result) => {
                                                if (err) {
                                                    console.log(err)
                                                    res.send('Failed to grant you admin privileges');
                                                } else {
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
        if (err) {
            console.log(err)
        }
        const { user, code } = req.body;

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
            db.query("SELECT * FROM Teams WHERE team_code = '" + code + "' ", (err, result) => {
                if (err) {
                    console.log(err);
                    reject();
                }
                if (result.length == 0) {
                    console.log('Invalid code!');
                    res.send('Invalid code')
                }
                if (result.length > 0) {
                    console.log('Found the team');
                    teamID = result[0].team_id;
                    teamName = result[0].team_name;
                    db.query("SELECT * FROM Members WHERE user_id = '" + userID + "' AND team_id = " + teamID + "", (err, result) => {
                        if (err) {
                            console.log(err);
                            reject();
                        }
                        if (result.length > 0) {
                            res.send("You're already a member of " + teamName + "!")
                        } else {
                            db.query('INSERT INTO Members (team_id, user_id) VALUES (' + teamID + ', ' + userID + ');', (err, result) => {
                                if (err) {
                                    console.log(err);
                                    reject();
                                }
                                res.send('You joined ' + teamName);
                            })
                        }
                    })
                }
            })
        })
    })

app.route('/team/:user')
    //Get team names of any teams the user is a member of
    .get(function (req, res, err) {
        if (err) {
            console.log(err)
        }
        const user = req.params.user;

        console.log("user is " + user)
        const dbPromise = new Promise((resolve, reject) => {

            db.query("SELECT * FROM users WHERE user_name = '" + user + "'", (err, result) => {
                if (err) {
                    console.log(err)
                    reject('There was an error querying the database');
                }
                if (result.length == 0) {
                    console.log('This user does not exist in DB');
                    reject('This user does not exist in DB');
                }
                if (result.length > 0) {
                    console.log('This user exists in DB');
                    userID = result[0].user_id;
                    resolve(userID);
                }
            })
        }).catch(function (error) {
            console.log(error);
            return res.status(404).send(error)
        });
        dbPromise.then((userID) => {
            db.query("SELECT * FROM Members WHERE user_id = '" + userID + "'", (err, result) => {
                if (err) {
                    console.log(err)
                    reject();
                }
                if (result.length == 0) {
                    return res.send('User is not on a team');
                } else {
                    return new Promise((resolve, reject) => {
                        var teamIDs = [];
                        for (let i = 0; i < result.length; i++) {
                            teamIDs.push(result[i].team_id);
                        }
                        resolve(teamIDs);
                    }).then((teamIDs) => {
                        console.log('HERE ARE THE TEAM IDS: ' + teamIDs);
                        var myTeams = [];
                        async function asyncLoop(){
                            for (let i = 0; i < teamIDs.length; i++) {
                                return await asyncQuery(teamIDs[i]);
                            }
                        }
                        async function asyncQuery(id){
                            db.query("SELECT * FROM Teams WHERE team_id = " + id + "", (err, result) => {
                                if (err) {
                                    console.log(err)
                                }
                                //console.log(result)
                                //myTeams.push(result);
                                //console.log(myTeams);
                                return result;
                                
                            })
                        }
                        myTeams.push(asyncLoop());
                        console.log(myTeams);
                        res.send(myTeams);
                    })

                }

            })//Cannot read properties of undefined - "length" of teamIDs
            //Console.log is showing up after that message - teamIDs is
            //being returned before being filled for some reason?
        }).catch(function (error) {
            console.log("Here is your error: " + error)
            return res.status(404).send(error)
        })
    })