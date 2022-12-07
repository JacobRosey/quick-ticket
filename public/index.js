//Checks if user is logged in
function checkForUser() {
    let userN = document.getElementById('userN');
    let sideNav = document.getElementById('side-nav')
    let isLogged = sessionStorage.getItem('logged');
    let currentUser = sessionStorage.getItem('user');

    if (isLogged == 'true') {
        userN.innerHTML = currentUser;
        sideNav.style.display = "block";
    } else {
        sideNav.style.display = "none";
    }
}

function setActiveLink() {
    //Get current page
    let active = window.location.href.replace("https://quick-ticket.herokuapp.com/", "");
    const user = sessionStorage.getItem('user');
    const container = document.getElementById('breadcrumb-container');


    //If on login or register page, don't care about nav stuff
    //because it's not visible on screen
    if (active !== 'login' && active !== 'register') {
        let text = document.getElementById(active);
        text.style.fontWeight = 'bold';
        if (active !== 'home') {
            document.getElementById('home').style.fontWeight = 'normal'
        } else{
            ajaxFunc('/home/' + user + '/', 'GET', user)
        }

        if (active.includes('ticket')) {
            document.getElementById('tickets').style.textDecoration = "underline"
            let navLink = document.getElementById('submenu1');
            navLink.className = "nav flex-column ms-1 collapse show";
            navLink.setAttribute("aria-expanded", "true");
            if (active == 'closedtickets') {
                console.log('Starting ajaxfunction on closedtickets page load');
                const data = {
                    "user": user,
                    "status": 2
                }
                ajaxFunc('/ticketdata/' + data.user + '/' + data.status, 'GET', data);
                container.innerHTML += `<h3>Closed Tickets</h3>`
            }
            if (active == 'newticket') {
                console.log('Starting ajaxfunction on newticket page load');
                ajaxFunc('/get-teams/' + user + '/', 'GET', user)
                container.innerHTML += `<h3>Create New Ticket</h3>`
            }
            if (active == 'opentickets') {
                console.log('Starting ajaxfunction on opentickets page load');
                const data = {
                    "user": user,
                    "status": 0
                }
                ajaxFunc('/ticketdata/' + data.user + '/' + data.status, 'GET', data);
                container.innerHTML += `<h3>Open Tickets</h3>`
            }
            if (active == 'mytickets') {
                console.log('Starting ajaxfunction on mytickets page load');
                const data = {
                    "user": user,
                    "status": 1
                }
                ajaxFunc('/ticketdata/' + data.user + '/' + data.status, 'GET', data)
                container.innerHTML += `<h3>My Tickets</h3>`
            }
            return;
        }
        if (active == 'team') {
            console.log('Starting ajaxfunction on team page load')
            ajaxFunc('/team/' + user + '', 'GET', user);
            container.innerHTML += `<h3>My Teams</h3>`
        }
    }

}

function clickedLogo() {
    let isLogged = sessionStorage.getItem('logged');

    if (isLogged == 'true') {
        window.location.replace('/home')
    }
}

function logOut() {
    let isLogged = sessionStorage.getItem('logged');
    if (isLogged !== 'true') {
        return alert("You aren't logged in!")
    } else {
        //Reset session storage on logout
        sessionStorage.setItem('logged', false);
        sessionStorage.setItem('user', 'none');
        alert("Logout Successful.");
        window.location.replace('/login')
        checkForUser();
    }

}

function createTeam() {
    //replace spaces in team name with hyphens
    let team = document.getElementById('entered-team-name').value.trim().replace(/\s+/g, ' ').replace(/ /g, "-");
    let admin = sessionStorage.getItem('user');


    if (team == '') {
        return alert('You must enter a team name!')
    }
    let data = {
        "admin": admin,
        "team": team
    }

    ajaxFunc('/index/' + admin + '/' + team + '', 'POST', data)
}

function joinTeam() {
    //get entered code, remove leading/trailing whitespace and other spaces
    let code = document.getElementById('entered-code').value.trim().replace(/\s+/g, ' ').replace(/ /g, "");
    let user = sessionStorage.getItem('user');

    if (code == '') {
        return alert('You must enter a team code!')
    }
    console.log(code)

    let data = {
        "user": user,
        "code": code
    }

    ajaxFunc('/index2/' + user + '/' + code + '', 'POST', data)
}

function getLogin() {
    let isLogged = sessionStorage.getItem('logged');
    console.log(isLogged)
    if (isLogged === 'true') {
        return alert("You're already logged in!")
    } else {
        let user = document.getElementById('loginUser').value;
        let pass = document.getElementById('loginPass').value;

        console.log("Getting login data...")

        let data = {
            "user": user,
            "pass": pass
        }
        console.log('now doing ajax function with ' + data)
        ajaxFunc('/login/' + data.user + '/' + data.pass + '', "GET", data);
        checkForUser();
    }

}

function newTicket() {
    let user = sessionStorage.getItem('user');
    let team = document.getElementById('team-select-input').value;
    let title = document.getElementById('ticketTitle').value;
    let prio = document.getElementById('ticketPriority').value;
    let desc = document.getElementById('ticketDesc').value;

    if (title.trim() == '' || desc.trim() == '') {
        return alert("Please fill out the form properly!")
    }

    let data = {
        "user": user,
        "team": team,
        "title": title,
        "prio": prio,
        "desc": desc
    }

    //Not sure if this is where I need to encodeURIcomponent or not but... figure dat out
    ajaxFunc('/newticket/' + user + '/' + team + '/' + title + '/' + prio + '/' + desc, 'POST', data)
}

function changeTicketStatus(id) {
    let active = window.location.href.replace("https://quick-ticket.herokuapp.com/", "");
    let user = sessionStorage.getItem('user'); 
    let data = {
        "user":user,
        "id": id,
        "active":active
    }
    ajaxFunc('/ticketstatus/', 'PUT', data)
}

function deleteTeam(num) {
    //const teamInfoCards = document.getElementsByClassName('team-info');
    const teamName = document.getElementsByClassName('team-name-span');
    //Replace whitespace, replace hyphen with space
    let string = teamName[num].innerHTML.trim().replace(/-/g, ' ');

    if (confirm('Are you sure you want to delete "' + string + '"? This will also delete all associated data such as tickets and team members. This cannot be reversed.')) {
        //Only admins can delete the team
        const user = sessionStorage.getItem('user');
        let data = {
            "user": user,
            "team": string.replace(/ /g, '-')
        }
        console.log(data)
        ajaxFunc('/delete-team/:user', "PUT", data);


    }
}

function ajaxFunc(path, method, d) {

    let xhr = new XMLHttpRequest();
    xhr.open(method, path, true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    if (method == 'GET') {
        console.log(path)
        console.log('This is a get request');
        xhr.send(d);
        xhr.onload = () => {
            if (xhr.status == 200) {
                console.log('success');
            } else console.log('status ' + xhr.status)
            //State whether login was successful or not
            var response = xhr.responseText;
            switch (response) {
                case "Login Successful!":
                    //Redirect to the home page after successful login
                    window.location.replace('/home');
                    alert(response);
                    //Setup session storage
                    sessionStorage.setItem('logged', true);
                    sessionStorage.setItem('user', d.user);
                    break;
                case "Incorrect Password!":
                    alert(response)
                    document.getElementById('loginPass').value = '';
                    break;
                case "This username does not exist!":
                    alert(response);
                    break;
                case "User is not on a team":
                    useResponse("Not on a team");
                    break;
                default:
                    console.log("response is " + response);
                    useResponse(JSON.parse(response))

            }
        }
    }

    if (method == 'POST') {
        console.log(path)
        console.log('This is a post request');
        console.log(JSON.stringify(d));
        xhr.send(JSON.stringify(d));
        xhr.onload = () => {
            if (xhr.status == 200) {
                console.log('success');
            } else console.log('status ' + xhr.status)
            //State whether login was successful or not
            var response = xhr.responseText;
            console.log(response)
            switch (response) {
                case "Team creation failed":
                    alert(response);
                    document.getElementById('entered-team-name').value = '';
                    break;
                case "Team created":
                    alert(response);
                    setTimeout(() => {
                        window.location.replace('/home')
                    }, 500)
                    break;
                default:
                    alert(response);
                    setTimeout(() => {
                        window.location.replace('/home')
                    }, 500)
            }
        }
    }
    if (method == "PUT") {
        console.log(path)
        console.log('This is a put request');
        console.log(JSON.stringify(d));
        xhr.send(JSON.stringify(d));
        xhr.onload = () => {
            if (xhr.status == 200) {
                console.log('success');
            } else console.log('status ' + xhr.status)
            //State whether login was successful or not
            var response = xhr.responseText;
            if (response == "User is not an admin") {
                alert("You don't have permission to delete this team!")
            } else {
                setTimeout(() => {
                    useResponse(response)
                }, 100)
            }
        }
    }
    xhr.onerror = () => {
        console.log("Something went wrong")
    }
}

function useResponse(res) {
    const active = window.location.href.replace("https://quick-ticket.herokuapp.com/", "");
    //If this is the team page load response
    const container = document.getElementById('team-card-container');
    if (res == "Not on a team") {
        container.innerHTML += `
        <div class="jumbotron">
        <span><i class="fs-4 bi-people"></i><p class="text-center" style="font-weight: bold;">You are not a member of a team!</p></span>
        <p class="lead">Go to the home page and create a new team, or join an existing team using the team code!</p>
        <hr class="my-4">
        <p>Ask your manager for the team code so you can get to work! If you create a new team, come back to this page to see the team code.</p>
        <p class="lead">
          <a class="btn btn-primary btn-lg" href="/home" role="button">Home Page</a>
        </p>
      </div>
        `
    }
    if(active == 'home'){
        let count = document.getElementById('ticket-count');
        count.innerHTML = res;
    }
    if(res.includes('Ticket')){
        alert(res); 
        window.location.reload();
    }
    //If response is an array
    if (Array.isArray(res)) {
        if (res[0].hasOwnProperty('team_id') && res[0].hasOwnProperty('team_name')) {

            for (let i = 0; i < res.length; i++) {
                container.innerHTML += `
                <div class="col-sm">
                <div class="team-info">
                <div class="card" id="team-card"style="width: 18rem;">
                <div class="card-header" style="font-weight: bolder;">
                <i class="fs-4 bi-people" style="margin-right: .25em;"></i><span class="team-name-span">
                    `+ res[i].team_name + `
                </span></div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item" id="team-code" >Invitation Code: <span style="font-weight: 300;">`+ res[i].team_code + `</span></li>
                    <li class="list-group-item" id="member-count">Total Members: <span style="font-weight: 300;">` + res[i].member_count + `</span></li>
                    <li class="list-group-item">Team Admin: <span id="admin-name" style="font-weight: 300;">`+ res[i].admin_name + `</span></li>
                </ul>
                <a class="btn btn-danger" onClick="deleteTeam(`+ i + `)" role="button" style="font-weight: bold; line-height: 32.5px !important;">Delete Team</a>
                </div>
                </div>
                </div>
                `
            }
        }
        if (res[0] == 'team_names') {
            let teamSelectContainer = document.getElementById('team-select');
            //remove 'team_names' from arr, that only served to show there are multiple teams
            console.log(res);
            res.shift();
            console.log(res);
            teamSelectContainer.innerHTML +=
                `<div class="form-group">
                <label for="exampleFormControlSelect1">Select Team</label>
                <select class="form-control" name="team-select-input" id="team-select-input" required>
                </select>
            </div>`

            let teamSelectInput = document.getElementById('team-select-input');
            for (let i = 0; i < res.length; i++) {
                teamSelectInput.innerHTML +=
                    `
                    <option>`+ res[i] + `</option>
                    `

            }
        }
        if (res[0].hasOwnProperty('ticket_id')) {
            console.log('these are tickets');
            
            //Remove null from array
            res = res.filter(function (el) {return el!=null;})
            console.log(res)

            //Consolidate ticket and ticket_data table values       
            for(let i=0; i< res.length; i++){
                for(let j=i+1; j<res.length; j++){
                    if(res[i].ticket_id == res[j].ticket_id){
                        console.log('Ticket IDs are a match! IDs = '+ res[i].ticket_id);
                        res[i].ticket_desc = res[j].ticket_desc;
                        res[i].img_path = res[j].img_path;
                        res[i].ticket_priority = res[j].ticket_priority;
                        //Remove res[j] because we just took its data, no longer need it
                        res.splice(j, 1)

                    } else{
                        console.log('Ticket IDs do not match, skipping. IDs = ' + res[i].ticket_id +' '+ res[j].ticket_id)
                    }
                }
            }
            
            console.log("array before adding html elements: " + res)
            let container;
            let btnText;
            let status;
            //Need to check if this is "my tickets", "closed tickets" or "open tickets" to know 
            //what to do with response
            if (active == 'opentickets') {
                container = document.getElementById('open-tickets');
                btnText = 'Claim Ticket';
                console.log('open tickets got response');
                status = 'Open';
            } else if (active == 'closedtickets') {
                container = document.getElementById('closed-tickets');
                btnText = 'Re-Open Ticket';
                status = 'Closed'
                console.log('closed tickets got response');
            }
            else if (active == 'mytickets') {
                container = document.getElementById('my-tickets');
                btnText = 'Close Ticket';
                status = 'In Progress'
                console.log('My tickets got response');
            }
            for (let i = 0; i < res.length; i++) {
                container.innerHTML +=
                    `
                        <div class="card text-center">
                            <div class="card-header">
                                <b>Ticket ID #`+ res[i].ticket_id + `</b> - <span class="text-muted">
                                Created: `+ res[i].creation_date + `
                                </span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">`+ res[i].ticket_title + `</h5>
                            <p class="card-text">`+ res[i].ticket_desc + `</p>
                            <p class="card-text">Priority: `+ res[i].ticket_priority + `</p>
                            <a href="#" class="btn btn-primary">View Ticket</a>
                            <a onClick="changeTicketStatus(`+ res[i].ticket_id + `)" class="btn btn-primary">` + btnText + `</a>
                        </div>
                        <div class="card-footer text-muted">
                            <b>Opened by:</b> `+ res[i].opened_by + ` <b>Status:</b> ` + status + `
                        </div>
                    </div>
                        `
            }
        }
    }

    if (res == "Team deleted") {
        alert('team deleted')
        location.reload();
    }
    if (res == "Ticket created") {
        alert(res);
        window.location.replace('/newticket')
    }
}

//Should probably figure out how to use cookies so that you can't 
//edit/delete a user that is logged in on another tab or computer as well
window.onload = checkForUser(); setActiveLink();