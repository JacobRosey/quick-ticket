const express = require('express');
const mysql = require('mysql2');
const exphbs = require('express-handlebars');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
app.use('/register', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

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
            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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

app.route('/home/:user')
    .get(function (req, res, err) {
        const user = req.params.user;

        const dbPromise = new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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

            async function getData() {
                let arr = [];
                let sql = "SELECT * FROM Members WHERE user_id = ?";
                db.promise().query(sql, [userID])
                    .then(([rows, fields]) => {
                        for (let i = 0; i < rows.length; i++) {
                            arr.push(rows[i].team_id)
                        }
                    }).catch(err => { console.log(err) })
                return arr;
            }
            getData().then((arr) => {
                return new Promise((resolve, reject) => {

                    let tickets = 0;
                    setTimeout(() => {
                        let sql = "SELECT * FROM Tickets WHERE team_id = ? AND ticket_status = 0";
                        for (let i = 0; i < arr.length; i++) {
                            db.promise().query(sql, [arr[i]])
                                .then(([rows, fields]) => {
                                    tickets += rows.length;
                                    console.log(tickets)
                                }).catch(err => { console.log(err) })
                        }
                    }, 25)
                    setTimeout(() => {
                        resolve(tickets);
                    }, 50)
                }).then((t) => {
                    setTimeout(() => {
                        console.log('Returning tickets')
                        res.send(t.toString());
                    }, 75)
                })
            })
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
            db.query("SELECT * FROM users WHERE user_name = ?", [admin], (err, result) => {
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
            db.promise().query('SELECT * FROM Teams WHERE team_name = ?', [team])
                .then(([rows, fields]) => {
                    if (rows.length > 0) {
                        return res.send("Team name not available");
                    } else {
                        const teamCode = crypto.randomBytes(5).toString('hex');
                        db.query(`INSERT INTO Teams (team_name, team_code) VALUES (?, ?);`, [team, teamCode], (err, result) => {
                            if (err) {
                                console.log(err)
                                res.send('Team creation failed');
                            } else {
                                db.query('SET @last_id = (SELECT LAST_INSERT_ID()); ', (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send('Failed to get last inserted team id');
                                    } else {//Could use an SQL trigger instead but not sure if that would be any better
                                        db.query(`INSERT INTO Members (user_id, team_id) VALUES (?, @last_id);`, [userID], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.send('Failed to insert you into members table')
                                            } else {
                                                db.query(`INSERT INTO Admins (user_id, team_id) VALUES (?, @last_id);`, [userID], (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                        res.send('Failed to insert you into admin table');
                                                    }
                                                    else {
                                                        //Get user who created the team, set is_admin to 1, aka "true"
                                                        db.query("UPDATE Users SET is_admin = 1 WHERE user_id = ?", [userID], (err, result) => {
                                                            if (err) {
                                                                console.log(err)
                                                                res.send('Failed to grant admin privileges');
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
                    }
                })
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

            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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
            db.query("SELECT * FROM Teams WHERE team_code = ?", [code], (err, result) => {
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
                    db.query("SELECT * FROM Members WHERE user_id = ? AND team_id = ?", [userID, teamID], (err, result) => {
                        if (err) {
                            console.log(err);
                            reject();
                        }
                        if (result.length > 0) {
                            res.send("You're already a member of " + teamName + "!")
                        } else {
                            db.query('INSERT INTO Members (team_id, user_id) VALUES (?, ?);', [teamID, userID], (err, result) => {
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

//USED TO APPEND CARDS TO MY TEAM PAGE - THE ONES THAT SHOW 'DELETE TEAM' ON THEM
app.route('/team/:user')
    //Get team names of any teams the user is a member of
    .get(function (req, res, err) {
        if (err) {
            console.log(err)
        }
        const user = req.params.user;

        const dbPromise = new Promise((resolve, reject) => {

            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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
            db.query("SELECT * FROM Members WHERE user_id = ?", [userID], (err, result) => {
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

                        //My issue with this code was that I thought async/await caused
                        //the function to wait until resolution before moving onto the 
                        //.then statement. it seems that this only defines the order of
                        //the functions being called, not the order of resolution.
                        async function getData() {
                            let arr = [];
                            for (let i = 0; i < teamIDs.length; i++) {
                                db.promise().query("SELECT * FROM Teams WHERE team_id = ?", [teamIDs[i]])
                                    .then(([rows, fields]) => {
                                        arr.push(rows);
                                        //Get number of members in each team
                                        db.promise().query("SELECT * FROM Members WHERE team_id = ?", [teamIDs[i]])
                                            .then(([rows, fields]) => {
                                                //Change 2d array to 1d array before we...
                                                arr = [].concat(...arr)
                                                //Add key-value pair for member-count
                                                arr[i].member_count = rows.length;
                                                db.promise().query("SELECT * FROM Admins WHERE team_id = ? LIMIT 1", [teamIDs[i]])
                                                    .then(([rows, fields]) => {
                                                        rows = [].concat(...rows)
                                                        //rows = JSON.stringify(rows)
                                                        console.log(rows)
                                                        console.log('user id is ' + rows[0].user_id);
                                                        db.promise().query("SELECT user_name FROM Users WHERE user_id = ?", [rows[0].user_id])
                                                            .then(([rows, fields]) => {
                                                                arr = arr.concat(...arr);
                                                                arr[i].admin_name = rows[0].user_name;
                                                            })
                                                    })
                                            })
                                    }).catch(err => {
                                        console.log(err)
                                    })
                            }
                            return arr;
                        }
                        getData().then((response) => {
                            setTimeout(() => {
                                //For some reason have to change 2d array to normal array again?
                                response = [].concat(...response);
                                res.send(response)
                            }, 50)
                        })
                    })
                }
            })
        }).catch(err => {
            console.log("Here is your error: " + err)
            return res.status(404).send(err)
        })
    })

app.route('/closedtickets/:user')
    .get(function (req, res, err) {
        const user = req.params.user;
        console.log(user);
        const dbPromise = new Promise((resolve, reject) => {

            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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
                    let userID = result[0].user_id;
                    resolve(userID);
                }
            })
        })

        dbPromise.then((response) => {
            console.log('user id: ' + response)
            res.status(200).send(response.toString())
        })
    })

app.route('/delete-team/:user')
    .put(function (req, res, err) {
        const { user, team } = req.body;
        console.log(user, team);
        const dbPromise = new Promise((resolve, reject) => {

            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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
                    let userID = result[0].user_id;
                    //For some reason when I get the value of is_admin
                    //it shows <buffer 01> instead of just 1, so I have
                    //to check the value like this
                    if (result[0].is_admin.includes(1)) {
                        console.log('this user is an admin')
                        resolve(userID)
                    }
                    else {
                        console.log('this user is not an admin')
                        reject('This user is not an admin');
                        return;
                    }
                    //resolve(userID);
                }
            })
        })

        dbPromise.then((userID) => {
            //Still need to make sure the userID is an admin of 
            //The given team. Last check only verified that user
            //is an admin of any team in general
            db.query("SELECT * FROM Admins WHERE user_id = ?", [userID], (err, result) => {
                if (err) {
                    console.log(err)
                }
                return new Promise((resolve, reject) => {
                    let arr = [];
                    for (let i = 0; i < result.length; i++) {
                        arr.push(result[i].team_id)
                    }
                    resolve(arr)
                }).then((arr) => {
                    console.log("this user is an admin for the following team_id's: " + arr);

                    async function getData() {
                        let teamNames = [];
                        for (let i = 0; i < arr.length; i++) {
                            db.promise().query("SELECT * FROM Teams WHERE team_id = ?", [arr[i]])
                                .then(([rows, fields]) => {
                                    teamNames.push(rows[0].team_name, rows[0].team_id);
                                }).catch(console.log)
                        }
                        return teamNames;
                    }
                    getData().then((response) => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                console.log(response)
                                if (response.includes(team)) {
                                    //If user is admin of the given team
                                    console.log("response includes team")
                                    const id = response.indexOf(team) + 1;
                                    console.log("returning this index: " + response[id])
                                    resolve(response[id]);
                                } else {
                                    console.log("User is not an admin for this team")
                                    resolve(false);
                                }
                            }, 50)
                        }).then((response) => {
                            setTimeout(() => {
                                if (response === false) {
                                    return res.send("User is not an admin")
                                } else {
                                    console.log('The team id to be deleted: ' + response)
                                    db.query("DELETE FROM Teams WHERE team_id = ?", [response], (err, result) => {
                                        if (err) {
                                            console.log(err)
                                        }
                                        res.send("Team deleted")
                                    })
                                }
                            }, 100)
                        })

                    })
                })

            })
        }).catch(err => {
            console.log(err)
            res.send(err)
        });
    })

app.route('/newticket')
    .post(function (req, res, err) {
        //Need to decodeURIcomponent on parameters here
        const { encodedUser, encodedTeam, encodedTitle, encodedPrio, encodedDesc } = req.body;
        const user = decodeURIComponent(encodedUser);
        const team = decodeURIComponent(encodedTeam);
        const title = decodeURIComponent(encodedTitle).replace(/\\'/g, "'");
        const prio = decodeURIComponent(encodedPrio);
        const desc = decodeURIComponent(encodedDesc).replace(/\\'/g, "'");


        console.log(user + team + prio + title + desc);

        const dbPromise = new Promise((resolve, reject) => {
            let sql = 'SELECT team_id FROM Teams WHERE team_name = ?;'
            db.query(sql, [team], (err, result) => {
                if (err) {
                    console.log(err)
                }
                resolve(result)
            })
        })
        dbPromise.then((id) => {
            console.log(id[0].team_id);
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            console.log(timestamp);
            //START TRANSACTION still not working
            //neither is multiple statements in 1 query
            let sql = 'INSERT INTO Tickets (team_id, ticket_title, ticket_status, opened_by, creation_date) VALUES (?, ?, ?, ?, ?);'
            db.query(sql, [id[0].team_id, db.escape(title), 0, db.escape(user), timestamp], (err, result) => {
                if (err) {
                    console.log(err)
                    res.send('Ticket creation failed')
                }
                else {
                    db.query('SET @last_id = (SELECT LAST_INSERT_ID());', (err, result) => {
                        if (err) {
                            console.log(err)
                            res.send('Ticket creation failed')
                        } else {
                            let sql = 'INSERT INTO Ticket_Data (ticket_id, ticket_desc, ticket_priority) VALUES (@last_id, ?, ?)'
                            db.query(sql, [db.escape(desc), db.escape(prio)], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.send('Ticket creation failed')
                                }
                                else {
                                    console.log('Ticket created');
                                    db.promise().query("UPDATE Users SET tickets_opened = tickets_opened + 1 WHERE user_name = ?", [user]);
                                    res.send('Ticket created');
                                }
                            })

                        }
                    })
                }
            });
        })

    })

app.route('/get-teams/:user')
    .get(function (req, res, err) {
        const user = req.params.user;
        console.log(user);

        const dbPromise = new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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
                    let userID = result[0].user_id;
                    resolve(userID);
                }
            })
        })

        dbPromise.then((id) => {
            async function getData() {
                let teamIDs = [];
                db.promise().query("SELECT * FROM Members WHERE user_id = ?", [id])
                    .then(([rows, fields]) => {
                        for (let i = 0; i < rows.length; i++) {
                            teamIDs.push(rows[i].team_id);
                        }
                    }).catch(console.log)
                return teamIDs;
            }
            getData().then((response) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        let arr = []
                        for (let i = 0; i < response.length; i++) {
                            db.promise().query("SELECT * FROM Teams WHERE team_id = ?", [response[i]])
                                .then(([rows, fields]) => {
                                    arr.push(rows[0].team_name)
                                }).catch(err => console.log(err))
                        }
                        resolve(arr);
                        //Do stuff with id's here
                    }, 50)
                }).then((response) => {
                    setTimeout(() => {

                        response.unshift('team_names')
                        console.log("returning res: " + response)
                        res.send(JSON.stringify(response))

                        //return team names here
                    }, 100)
                })

            })

        }).catch(err => {
            console.log(err)
        })
        //res.send(user)
    })

app.route('/ticketdata/:user/:status')
    .get(function (req, res, err) {
        const user = req.params.user;
        const status = req.params.status
        console.log(user);

        const dbPromise = new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE user_name = ?", [user], (err, result) => {
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
                    let userID = result[0].user_id;
                    resolve(userID);
                }
            })
        })
        dbPromise.then((id) => {
            async function getData() {
                let teamIDs = [];
                db.promise().query("SELECT * FROM Members WHERE user_id = ?", [id])
                    .then(([rows, fields]) => {
                        for (let i = 0; i < rows.length; i++) {
                            teamIDs.push(rows[i].team_id);
                        }
                    }).catch(console.log)
                return teamIDs;
            }
            getData().then((response) => {
                return new Promise((resolve, reject) => {
                    let arr = []
                    //For open/closed tickets
                    if (status != 1) {
                        setTimeout(async () => {
                            await Promise.all(response.map(async res => {
                                console.log(`now getting tickets where ticket id = ${res}`)
                                await db.promise().query("SELECT * FROM Tickets WHERE team_id = ? AND ticket_status = ?", [res, status])
                                    .then(([rows, fields]) => {
                                        arr.push(rows)
                                    }).catch(err => console.log(err))
                                arr = [].concat(...arr)
                            }))
                            await arr.forEach(async (row) => {
                                console.log('Now querying DB for this ticket id: ' + row.ticket_id)
                                db.promise().query("SELECT * FROM Ticket_Data WHERE ticket_id = ?", [row.ticket_id])
                                    .then(([rows, fields]) => {
                                        arr.push(rows)
                                    }).catch(err => console.log(err))
                            })
                            resolve(arr);
                        }, 50)
                    } else {
                        //For 'My Tickets'
                        setTimeout(async () => {
                            await Promise.all(response.map(async res => {
                                console.log(`now getting tickets where ticket id = ${res}`)
                                await db.promise().query("SELECT * FROM Tickets WHERE team_id = ? AND ticket_holder = ?", [res, user])
                                    .then(([rows, fields]) => {
                                        arr.push(rows)
                                    })
                                arr = [].concat(...arr);
                            }))

                            //Not sure why this works because I'm looping through each element of arr
                            //while simultaneously adding elements to the arr. I expected an infinite loop
                            await arr.forEach(async (row) => {
                                console.log('Now querying DB for this ticket id: ' + row.ticket_id)
                                db.promise().query("SELECT * FROM Ticket_Data WHERE ticket_id = ?", [row.ticket_id])
                                    .then(([rows, fields]) => {
                                        arr.push(rows)
                                    }).catch(err => console.log(err))
                            })
                            resolve(arr);
                        }, 50)
                    }
                }).then((response) => {
                    setTimeout(() => {
                        response = [].concat(...response);
                        console.log("returning res: " + JSON.stringify(response))
                        res.send(response)
                    }, 150)
                })

            })

        }).catch(err => {
            console.log(err)
        })
    })

app.route('/ticketstatus')
    .put(function (req, res, err) {
        const { user, id, active } = req.body;
        console.log(user, id, active);
        //Get current date for either opened or closed date
        const date = new Date();
        switch (active) {
            //To claim a ticket
            case 'opentickets':
                db.promise().query("UPDATE Tickets SET ticket_holder = ?, ticket_status = 1 WHERE ticket_id = ?", [user, id]);
                res.send('Ticket claimed')
                break;
            //To re-open a ticket
            case 'closedtickets':
                db.promise().query("UPDATE Tickets SET ticket_holder = null, ticket_status = 0, creation_date = ? WHERE ticket_id = ?", [date, id]);
                db.promise().query("UPDATE Users SET tickets_opened = tickets_opened + 1 WHERE user_name = ?", [user]);
                res.send('Ticket re-opened');
                break;
            //To close a ticket
            case 'mytickets':
                db.promise().query("UPDATE Tickets SET ticket_holder = null, ticket_status = 2, closed_by = ?, closed_date = ? WHERE ticket_id = ?", [user, date, id]);
                db.promise().query("UPDATE Users SET tickets_closed = tickets_closed + 1 WHERE user_name = ?", [user]);
                res.send('Ticket closed');
                break;
            default: res.send('Something went wrong');
        }
    })
app.route('/performance/:user')
    .get(function (req, res, err) {
        const user = req.params.user;
        console.log(user)
        let arr = [];
        db.promise().query("SELECT * FROM Users WHERE user_name = ?", [user])
            .then(([rows, fields]) => {
                console.log(rows[0]);
                arr.push(rows[0]);
            })
        db.promise().query("SELECT * FROM Tickets WHERE ticket_holder = ?", [user])
            .then(([rows, fields]) => {
                console.log(rows.length);
                arr.push(rows.length);
            })
        db.promise().query("SELECT * FROM Tickets WHERE opened_by = ? OR closed_by = ?", [db.escape(user), user])
            .then(([rows, fields]) => {
                console.log(rows.length);
                arr.push(rows)
            })
        setTimeout(() => {
            console.log('Here is the response')
            console.log(arr)
            res.send(arr)
        }, 50)

    })

app.route('/leave-team')
    .put(function (req, res, err) {
        const { user, team } = req.body;
        //Check to see if user is admin
        let sql = "SELECT * FROM Users WHERE user_name = ?;"
        db.promise().query(sql, user)
            .then(([rows, fields]) => {
                const userID = rows[0].user_id;
                sql = "SELECT * FROM Teams WHERE team_name = ?;"
                db.promise().query(sql, team)
                    .then(([rows, fields]) => {
                        const teamID = rows[0].team_id;
                        console.log(userID, teamID);
                        let sql = "SELECT * FROM Admins WHERE team_id = ? AND user_id = ? ;"
                        db.promise().query(sql, [teamID, userID])
                            .then(([rows, fields]) => {
                                console.log('There are ' + rows.length + ' rows. 0 if not admin, 1 if admin')
                                //User is not admin, proceed with deleting from team
                                if (rows.length === 0) {
                                    sql = "DELETE FROM Members WHERE user_id = ? AND team_id = ?"
                                    db.promise().query(sql, [userID, teamID])
                                        .then(res.send('You successfully left: ' + team))
                                }
                                //User is an admin, needs to assign admin privileges 
                                //to a team member before leaving
                                if (rows.length == 1) {
                                    //Get all other team members
                                    var teamMembers = []
                                    sql = "SELECT * FROM Members WHERE team_id = ?"
                                    db.promise().query(sql, teamID)
                                        .then(async ([rows, fields]) => {
                                            for (let i = 0; i < rows.length; i++) {
                                                console.log('looping through user IDs. Now on: ' + rows[i].user_id)
                                                sql = "SELECT * FROM Users where user_id = ?"
                                                await db.promise().query(sql, [rows[i].user_id])
                                                    .then(([rows, fields]) => {
                                                        teamMembers.push(rows[0].user_name)
                                                    })
                                            }
                                            teamMembers.push(teamID)
                                            setTimeout(() => {
                                                console.log('Sending res ' + teamMembers)
                                                res.send('Members are:' + teamMembers)
                                            }, 150)

                                        })
                                }
                            })
                    })
            })
    })

app.route('/admin-transfer')
    .put(function (req, res, err) {
        const { oldAdmin, newAdmin, teamID } = req.body;

        let sql = "SELECT * FROM Users WHERE user_name = ?"
        db.promise().query(sql, oldAdmin)
            .then(([rows, fields]) => {
                const oldAdminID = rows[0].user_id;
                db.promise().query(sql, newAdmin)
                    .then(([rows, fields]) => {
                        const newAdminID = rows[0].user_id;
                        sql = "UPDATE Admins SET user_id = ? WHERE user_id = ? AND team_id = ?;"
                        db.promise().query(sql, [newAdminID, oldAdminID, teamID])
                            .then(([rows, fields]) => {
                                console.log(rows);
                                db.promise().beginTransaction()
                                    .then(() => {
                                        sql = "DELETE FROM Members WHERE user_id = ? AND team_id = ?;";
                                        return db.promise().query(sql, [oldAdminID, teamID]);
                                    })
                                    .then(([rows, fields]) => {
                                        console.log(rows);
                                        res.send('Admin privileges transferred from ' + oldAdmin + ' to ' + newAdmin + '. ' + oldAdmin + ' has left the team.');
                                        return db.promise().commit();
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        db.promise().rollback();
                                        res.send(err);
                                    });


                            })
                    })

            })
    })

app.route('/invite-member/:user/:team')
    .post(function (req, res, err) {
        const { user, team } = req.body;
        console.log(team);
        const teamName = team.replace(/\s+/g, '-');
        //See if user from input form actually exists
        let sql = "SELECT * FROM Users WHERE user_name = ?;"
        db.promise().query(sql, user)
            .then(([rows, fields]) => {
                const userID = rows[0].user_id;
                let sql = "SELECT * FROM Teams WHERE team_name = ?";
                db.promise().query(sql, [teamName])
                    .then(([rows, fields]) => {
                        const teamID = rows[0].team_id;
                        sql = "SELECT * FROM Members WHERE team_id = ? AND user_id = ?";
                        db.promise().query(sql, [teamID, userID])
                            .then(([rows, fields]) => {
                                if (rows.length) {
                                    return res.send("That user is already on this team!")
                                } else {
                                    sql = "INSERT INTO Invitations VALUES (?, ?)";
                                    db.promise().query(sql, [user, teamName])
                                        .then(([rows, fields]) => {
                                            res.send('Invitation Sent!')
                                        }).catch(err => {
                                            console.error(err);
                                            db.promise().rollback();
                                            res.send(err)
                                        })
                                }
                            })
                    })
            }).catch(err => {
                console.error(err);
                db.promise().rollback();
                res.send('User does not exist');
            })
    })

app.route('/check-invitations/:user')
    .get(function (req, res, err) {
        const user = req.params.user;
        let sql = "SELECT * FROM Invitations WHERE user_name = ?";
        db.promise().query(sql, [user])
            .then(([rows, fields]) => {
                if (!rows.length) {
                    console.log('no rows')
                    res.send('User has no invitations');
                } else {
                    console.log(rows)
                    res.send(rows)
                }
            }).catch(err => {
                console.error(err);
                res.send('Error occurred')
            })

    })

app.route('/handle-invite/')
    .put(function (req, res, err) {
        const { user, team, bool } = req.body;
        console.log(user, team, bool)
        if (bool === 'true') {
            let sql = "SELECT * FROM Teams WHERE team_name = ?";
            db.promise().query(sql, team)
                .then(([rows, fields]) => {
                    const teamID = rows[0].team_id;
                    sql = "SELECT * FROM Users WHERE user_name = ?";
                    db.promise().query(sql, user)
                        .then(([rows, fields]) => {
                            const userID = rows[0].user_id;
                            sql = "INSERT INTO Members (user_id, team_id) VALUES (?, ?)";
                            db.promise().query(sql, [userID, teamID])
                                .then(([rows, fields]) => {
                                    sql = "DELETE FROM Invitations WHERE user_name = ? AND team_name = ?"
                                    db.promise().query(sql, [user, team]).then(([rows, fields])=> {
                                        res.send('You have successfully accepted the invitation')
                                    })
                                }).catch(err => {
                                    console.error(err);
                                    res.send('Error occurred')
                                })
                        }).catch(err => {
                            console.error(err);
                            res.send('Error occurred')
                        })
                }).catch(err => {
                    console.error(err);
                    res.send('Error occurred')
                })
        } else {
            let sql = "DELETE FROM Invitations WHERE user_name = ? AND team_name = ?";
            db.promise().query(sql, [user, team])
                .then(([rows, fields]) => {
                    res.send('You have successfully declined the invitation');
                }).catch(err => {
                    console.error(err);
                    res.send('Error occurred')
                })
        }
    })