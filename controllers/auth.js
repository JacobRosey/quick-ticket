const mysql = require('mysql');
const bcrypt = require('bcryptjs');

//Connect to Jaws DB 
const db = mysql.createConnection(process.env.JAWSDB_URL);

exports.register = async (req, res) => {
    console.log(req.body);

    const { user, password, passwordConfirm } = req.body;

    db.query('SELECT user_name FROM users WHERE user_name = ?', [user], async (err, result) => {
        if (err) {
            console.log(err);
            res.render('register', {
                failed: 'Registration failed. Please try again.'
            });
        } else if (result.length > 0) {
            res.render('register', {
                failed: 'That username is not available!'
            });
        } else if (user.length <= 6) {
            res.render('register', {
                failed: 'Username must be 6 or more characters'
            });
        } else if (password !== passwordConfirm) {
            res.render('register', {
                failed: 'Your passwords do not match!'
            });
        } else {
            //Hash the password 8 times using bcrypt
            let hashedPass = await bcrypt.hash(password, 8);
            console.log(hashedPass);
            db.query('INSERT INTO Users SET ?', { user_name: user, user_hash: hashedPass }, (err, result) => {
                if (err) {
                    console.log(err);
                    let failed = "Registration failed! Please try again"
                    res.redirect('/register?failed=' + encodeURIComponent(failed));
                } else {
                    let success = "Registration successful! Please log in."
                    res.redirect('/login?success=?' + encodeURIComponent(success))
                }
            });
        }
    });
    
};

exports.newTicket = (req, res) => {

    const { ticketTitle, ticketPriority, ticketDesc } = req.body;
    console.log(ticketTitle, ticketPriority, ticketDesc);
    if(ticketTitle.trim() == "" || ticketDesc.trim() == ""){
        return res.render('newticket', {
            fail: 'Fill out the form properly!'
        });
    }
    
    /*b.query('INSERT INTO Tickets(team_id, ticket_title, ticket_status, opened_by, creation_date)'
    'VALUES ()')*/
    
    
    res.render('newticket', {
        success: 'Ticket Created!'
    });
    
}