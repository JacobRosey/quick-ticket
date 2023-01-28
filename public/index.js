//Checks if user is logged in
function checkForUser() {

    if (window.location.href.replace("https://quick-ticket.herokuapp.com/", "") == 'login') {
        checkForCookies();
    }

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
// Function to check for cookies on page load
function checkForCookies() {
    var username = getCookie("username");
    var password = getCookie("password");

    if (username != "" && password != "") {
        document.getElementById("loginUser").value = username;
        document.getElementById("loginPass").value = password;
        document.getElementById("rememberMeCheckbox").checked = true;
    }
    // Function to get a cookie by name
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
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
        } else {
            ajaxFunc('/home/' + user + '/', 'GET', user)
        }

        if (active == 'performance') {
            console.log('This is the performance page');
            ajaxFunc('/performance/' + user + '/', 'GET', user)
            return;
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

    rememberMe();

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
    function rememberMe() {
        // Get the checkbox element
        var checkbox = document.getElementById("rememberMeCheckbox");

        // Check if the checkbox is checked
        if (checkbox.checked) {
            // Get the user's credentials
            var username = document.getElementById("loginUser").value;
            var password = document.getElementById("loginPass").value;

            //Set the cookies - 30 day lifespan
            setCookie("username", username, 30);
            setCookie("password", password, 30);
        } else {
            // Delete the cookies
            deleteCookie("username");
            deleteCookie("password");
        }
        // Function to set a cookie
        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        // Function to delete a cookie
        function deleteCookie(cname) {
            setCookie(cname, "", -1);
        }

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
        "user": user,
        "id": id,
        "active": active
    }
    ajaxFunc('/ticketstatus/', 'PUT', data)
}

function viewTicket(id) {
    const leadIn = document.getElementById('desc-id-' + id + '');
    const fullDesc = document.getElementById('full-desc-' + id + '');
    var btnText = document.getElementById('view-ticket-' + id + '');

    // Delay the animation by 100 milliseconds
    setTimeout(function () {
        if (leadIn.classList.contains('collapsed')) {
            leadIn.classList.remove('collapsed');
            fullDesc.classList.add('collapsed');
            btnText.innerHTML = 'Expand Ticket'
        } else {
            leadIn.classList.add('collapsed');
            fullDesc.classList.remove('collapsed');
            btnText.innerHTML = 'Collapse Ticket';
        }
    }, 100);
}

function leaveTeam(num) {
    const teamName = document.getElementsByClassName('team-name-span');
    //Replace whitespace, replace hyphen with space
    let string = teamName[num].innerHTML.trim().replace(/-/g, ' ');

    if (confirm('Are you sure you want to leave this team: "' + string + '"? This will also delete all of your membership data such as tickets opened, closed, etc. This cannot be reversed.')) {
        //Only admins can delete the team
        const user = sessionStorage.getItem('user');
        let data = {
            "user": user,
            "team": string.replace(/ /g, '-')
        }
        console.log(data)
        ajaxFunc('/leave-team/', "PUT", data);


    }
}

function deleteTeam(num) {
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
                    setTimeout(() => {
                        console.log("response is " + response);
                        useResponse(JSON.parse(response))
                    }, 100)

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
        <div style="display: flex; flex-direction: row;"><i class="fs-4 bi-people" style="margin-right: 15px;"></i><p class="text-center" style="font-weight: bold;">You are not a member of a team!</p></div>
        <p class="lead">Go to the home page and create a new team, or join an existing team using the team code!</p>
        <hr class="my-4">
        <p class="lead">
          <a class="btn btn-primary btn-lg" href="/home" role="button" style="margin: 0;">Home Page</a>
        </p>
      </div>
        `
        return;
    }
    if (active == 'home') {
        let count = document.getElementById('ticket-count');
        count.innerHTML = res;
    }
    if (active == 'team') {
        if (res.includes('Members')) {
            let arr = res.slice(12).split(',');
            console.log(arr)
            //If the user is the only member of the team
            if (arr.length == 2) {
                alert('You are the only member of this group - just delete it!')
                return;
            }
            //Remove current user as option because they're the admin
            //if i'm leaving a team i'm obviously not going to transfer 
            //privileges to myself
            const currentUser = sessionStorage.getItem('user');
            const index = arr.indexOf(currentUser);
            console.log(currentUser)
            arr.splice(index, 1);
            const teamID = arr[arr.length - 1];
            const trueLength = arr.length - 1;
            const container = document.getElementById('team-container');
            console.log('teamID is - ' + teamID);
            container.innerHTML +=
                `
                <button id="myBtn" style="visibility:hidden;">Open Modal</button>
                <div class="modal" id="myModal">
                    <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Leave Team</h5>
                        <button type="button" id="close" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Please transfer admin privileges to a team member before leaving!</p>
                        <form id="admin-candidates">
                        </form>
                        </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onClick="transferAdminPriv(`+ teamID + `);">Confirm</button>
                        </div>
                    </div>
                    </div>
                </div>
                `;

            const radioBtns = document.getElementById('admin-candidates')
            for (let i = 0; i < trueLength; i++) {
                radioBtns.innerHTML +=
                    `
                    <input type="radio" class="new-admin-inputs" value="` + arr[i] + `" name="new-admin">
                    <label for="option-`+ i + `" name="new-admin">` + arr[i] + `</label><br>
                    `
            }
            // Get the button that opens the modal
            var btn = document.getElementById("myBtn");

            // Get the modal
            var modal = document.getElementById("myModal");

            // Get the <span> element that closes the modal
            var close = document.getElementById("close");

            // When JS sends button click, open the modal 
            btn.onclick = function () {
                modal.style.display = "block";
            }

            // When the user clicks on <span> (x), close the modal
            close.onclick = function () {
                modal.style.display = "none";
                //Clear out past options from form
                radioBtns.innerHTML = '';
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    radioBtns.innerHTML = '';
                }
            }
            //Send click event to open modal
            btn.click();


            return;
        }
        if (res.includes('left')) {
            let teamName = res.slice(21);
            alert('Successfully left the following team: ' + teamName);
            window.location.reload();
        }
        //On page load
        if (!res.includes('New admin') && !res.includes('User deleted')) {
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
                    <div class="btn-group" role="group" style="display: flex; background-color: #f7f7f7;">
                    <a class="btn btn-secondary" onClick="leaveTeam(`+ i + `)" role="button" style="font-weight: bold; width: 50%; line-height: 32.5px !important;">Leave Team</a>
                    <a class="btn btn-danger" onClick="deleteTeam(`+ i + `)" role="button" style="font-weight: bold; width: 50%; line-height: 32.5px !important;">Delete Team</a>
                    </div>
                    </div>
                    </div>
                    </div>
                    `
            }
            return;
        }

    }
    if (active.includes('ticket')) {
        //New ticket created
        if (res.includes('Ticket')) {
            alert(res);
            window.location.reload();
        }
        //Before new ticket creation
        if (res[0] == 'team_names') {
            if (res.length == 1) {
                const container = document.getElementsByClassName('container')
                const form = document.getElementsByTagName('form');
                const breadcrumb = document.getElementById('breadcrumb-container');
                form[0].style.display = "none";
                breadcrumb.style.display = "none";

                container[0].innerHTML +=
                    `
                <div class="jumbotron">
                <div style="display: flex; flex-direction: row;"><i class="bi bi-plus-circle" style="margin-right: 15px;"></i><p class="text-center" style="font-weight: bold;">You can't create a ticket; you're not on a team!</p></div>
                <p class="lead">Go to the home page and join a team using the invitation code, or create a new one</p>
                <hr class="my-4">
                <p class="lead">
                <a class="btn" href="/home" role="button">Home</a>
                </p>
                </div>
                `
                return;

            }
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
        if (res.length == 0) {
            let top;
            let bottom;
            let link;
            let btn;
            let container;
            let iconClass;
            switch (active) {
                case 'opentickets':
                    top = 'Your team currently has zero open tickets!';
                    bottom = 'Go to the "new ticket" page and create a ticket for your team!'
                    link = '/newticket';
                    btn = 'New Ticket';
                    container = document.getElementById('open-tickets');
                    iconClass = "bi bi-circle";
                    break;
                case 'mytickets':
                    top = 'You are not currently assigned any tickets!';
                    bottom = 'Go to the "open tickets" page and claim some tickets to work on!'
                    link = '/opentickets';
                    btn = 'Open Tickets'
                    container = document.getElementById('my-tickets');
                    iconClass = "bi bi-tag"
                    break;
                case 'closedtickets':
                    top = 'Your team currently has zero closed tickets!';
                    bottom = 'Go to the "my tickets" page and complete a ticket so you can close it!'
                    link = '/mytickets';
                    btn = 'My Tickets'
                    container = document.getElementById('closed-tickets');
                    iconClass = "bi bi-x-circle"
                    break;
                case 'newticket':
                    return;
                default: window.location.reload();
            }
            container.innerHTML +=
                `
                <div class="jumbotron">
                <div style="display: flex; flex-direction: row;"><i class="`+ iconClass + `" style="margin-right: 15px;"></i><p class="text-center" style="font-weight: bold;">` + top + `</p></div>
                <p class="lead">`+ bottom + `</p>
                <hr class="my-4">
                <p class="lead">
                <a class="btn" href="`+ link + `" role="button">` + btn + `</a>
                </p>
            </div>
                `
            return;
        }
        //My/Open/Closed tickets
        if (res[0].hasOwnProperty('ticket_id')) {
            console.log('these are tickets');

            //Remove null from array
            res = res.filter(function (el) { return el != null; })
            console.log(res)

            //Consolidate ticket and ticket_data table values       
            for (let i = 0; i < res.length; i++) {
                for (let j = i + 1; j < res.length; j++) {
                    if (res[i].ticket_id == res[j].ticket_id) {
                        console.log('Ticket IDs are a match! IDs = ' + res[i].ticket_id);
                        res[i].ticket_desc = res[j].ticket_desc;
                        res[i].img_path = res[j].img_path;
                        res[i].ticket_priority = res[j].ticket_priority;
                        //Remove res[j] because we just took its data, no longer need it
                        res.splice(j, 1)

                    } else {
                        console.log('Ticket IDs do not match, skipping. IDs = ' + res[i].ticket_id + ' ' + res[j].ticket_id)
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
                let leadIn;
                let expandable;
                if (res[i].ticket_desc.length > 60) {
                    leadIn = res[i].ticket_desc.substr(0, 60) + '...';
                    expandable = true;
                }
                else {
                    leadIn = res[i].ticket_desc;
                    expandable = false;
                }
                if (expandable == true) {
                    container.innerHTML +=
                        `
                        <div class="card text-center">
                            <div class="card-header">
                                <b>Ticket ID #`+ res[i].ticket_id + `</b> - <span class="text-muted">
                                Created: `+ res[i].creation_date + `
                                </span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title" style="margin-bottom:1em; text-decoration: underline">`+ res[i].ticket_title + `</h5>
                            <p class="card-text" id="desc-id-`+ res[i].ticket_id + `" style="margin-bottom:1em;">` + leadIn + `</p>
                            <p class=" card-text collapsed" id="full-desc-`+ res[i].ticket_id + `">` + res[i].ticket_desc + `</p>
                            <p class="card-text">Priority: `+ res[i].ticket_priority + `</p>
                            <a onClick="viewTicket(`+ res[i].ticket_id + `)" class="btn btn-primary" id="view-ticket-` + res[i].ticket_id + `">Expand Ticket</a>
                            <a onClick="changeTicketStatus(`+ res[i].ticket_id + `)" class="btn btn-primary">` + btnText + `</a>
                        </div>
                        <div class="card-footer text-muted">
                            <b>Opened by:</b> `+ res[i].opened_by + ` <b>Status:</b> ` + status + `
                        </div>
                        </div>
                        `
                } else {
                    container.innerHTML +=
                        `
                        <div class="card text-center">
                            <div class="card-header">
                                <b>Ticket ID #`+ res[i].ticket_id + `</b> - <span class="text-muted">
                                Created: `+ res[i].creation_date + `
                                </span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title" style="margin-bottom:1em; text-decoration: underline">`+ res[i].ticket_title + `</h5>
                            <p class="card-text" id="desc-id-`+ res[i].ticket_id + `" style="margin-bottom:1em;">` + leadIn + `</p>
                            <p class="card-text">Priority: `+ res[i].ticket_priority + `</p>
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
    }

    if (active == 'performance') {
        let openHTML = document.getElementById('open-html');
        let closedHTML = document.getElementById('closed-html');
        let holdHTML = document.getElementById('hold-html')
        openHTML.innerHTML +=
            `
        You have opened a total of `+ res[0].tickets_opened + ` tickets.
        `;
        closedHTML.innerHTML +=
            `
        You have closed a total of `+ res[0].tickets_closed + ` tickets.
        `
        holdHTML.innerHTML +=
            `
        You are currently working on `+ res[1] + ` tickets.
        `
    }

    //After deleting a team
    if (res == "Team deleted") {
        alert('team deleted')
        location.reload();
    }
    //After creating a ticket
    if (res == "Ticket created") {
        alert(res);
        window.location.replace('/newticket')
    }
}

function transferAdminPriv(id) {
    let inputs = document.getElementsByClassName('new-admin-inputs');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            const newAdmin = inputs[i].value;
            console.log(newAdmin, id);
            return;
        }
        //If user clicks confirm without checking a radio btn
        if(i == inputs.length){
            alert('You must select a new admin!')
        }
    }
}

//Should probably figure out how to use cookies so that you can't 
//edit/delete a user that is logged in on another tab or computer as well
window.onload = checkForUser(); setActiveLink();