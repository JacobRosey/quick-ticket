const mysql = require('mysql');
const bcrypt = require('bcryptjs');

//Connect to Jaws DB 
const db = mysql.createConnection(process.env.JAWSDB_URL);

exports.register = (req, res) => {
    console.log(req.body);

    const { user, password, passwordConfirm } = req.body;

    db.query('SELECT user_name FROM users WHERE user_name = ?', [user], async (err, result) => {
        if (err) {
            console.log(err);
        }
        if (user.length <= 6) { 
            //Need to make these messages show a red banner,
            //right now it shows green banner as if the registration succeeded
            return res.render('register', {
                failed: 'Username must be 6 or more characters'
            });
        }
        if (result.length > 0) {
            return res.render('register', {
                failed: 'That username is not available!'
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                failed: 'Your passwords do not match!'
            });
        }
        //Hash the password 8 times using bcrypt
        let hashedPass = await bcrypt.hash(password, 8);
        console.log(hashedPass);
        db.query('INSERT INTO Users SET ?', { user_name: user, user_hash: hashedPass }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('register', {
                    success: 'User Registered!'
                });
            }
        }
        )
    });
}

exports.newTicket = (req, res) => {
    console.log("testing")
    
    res.render('newticket', {
        message: 'Ticket Created!'
    });
    
}