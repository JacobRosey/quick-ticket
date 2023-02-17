const mysql = require('mysql');
const bcrypt = require('bcryptjs');

//Connect to Jaws DB 
const db = mysql.createConnection(process.env.JAWSDB_URL);

exports.register = async (req, res) => {
    console.log(req.body);

    const { user, password, passwordConfirm } = req.body;

    try {
        const existingUser = await db.query('SELECT user_name FROM users WHERE user_name = ?', [user]);

        if (user.length <= 6) { 
            return res.render('register', {
                failed: 'Username must be 6 or more characters'
            });
        }

        if (existingUser.length > 0) {
            return res.render('register', {
                failed: 'That username is not available!'
            })
        }

        if (password !== passwordConfirm) {
            return res.render('register', {
                failed: 'Your passwords do not match!'
            });
        }

        let hashedPass = await bcrypt.hash(password, 8);
        console.log(hashedPass);
        await db.query('INSERT INTO Users SET ?', { user_name: user, user_hash: hashedPass });

        // Redirect to the login page with a success message
        console.log(res)
        res.redirect('/login?success=Registration%20successful.%20Please%20log%20in.');

    } catch (err) {
        console.log(err);
        res.render('register', {
            failed: 'An error occurred while processing your request. Please try again later.'
        });
    }
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