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
            ajaxFunc('/check-invitations/' + user + '/', 'GET', user)
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
            let ticketLink = document.getElementById('tickets-submenu');
            ticketLink.removeAttribute('href');
            ticketLink.removeAttribute('data-bs-toggle');
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
    } else return;
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

    const reservedRegex = /\\|\'|\"|%|<|>|&|#/g;
    if (reservedRegex.test(team)) {
        document.getElementById('entered-team-name').value = '';
        return alert('Team creation failed due to use of illegal characters');
    }

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
        "encodedUser": encodeURIComponent(user),
        "encodedTeam": encodeURIComponent(team),
        "encodedTitle": encodeURIComponent(title),
        "encodedPrio": encodeURIComponent(prio),
        "encodedDesc": encodeURIComponent(desc)
    }

    ajaxFunc('/newticket', 'POST', data)
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

function inviteNewMember(index) {
    const teamName = document.querySelectorAll('.team-name-span')[index].innerHTML.trim();
    console.log(teamName)
    const container = document.getElementById('team-container');
    let noHyphens = teamName.replace(/-/g, ' ');
    console.log(noHyphens)

    container.innerHTML +=
        `
        <button id="myBtn" style="visibility:hidden;">Open Modal</button>
        <div class="modal" id="myModal">
            <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Invite New Member</h5>
                <button type="button" id="close" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Enter the username of the person you wish to invite to `+ teamName + `.</p>
                <form id="new-member-form">
                    <label for="fname">Username:</label><br>
                    <input type="text" id="username" name="username">
                </form>
                </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" onClick="sendTeamInvite('`+ noHyphens + `');">Confirm</button>
                </div>
            </div>                                            
            </div>
        </div>
        `;

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
        modal.remove();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    //Send click event to open modal
    btn.click();
    return;
}

function sendTeamInvite(teamName) {
    var modal = document.getElementById("myModal");
    const newMember = document.getElementById('username').value.trim();

    modal.remove();

    const data = {
        user: newMember,
        team: teamName
    }

    ajaxFunc('/invite-member/:user/:team', "POST", data);
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
            if (response === undefined) {
                window.location.reload();
                return;
            } if (response.length === 0) {
                window.location.reload();
                return;
            }
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
                case "User has no invitations":
                    break;
                default:
                    setTimeout(() => {
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
            if (response === undefined) {
                window.location.reload();
                return;
            } if (response.length === 0) {
                window.location.reload();
                return;
            }
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
    //If placeholders exist in DOM, remove them (no placeholders in homepage)
    function removePlaceholders() {
        const placeholders = document.querySelectorAll('.placeholder');
        if (placeholders) {
            for (let i = 0; i < placeholders.length; i++) {
                placeholders[i].remove();
            }
        }
    }
    removePlaceholders();
    const active = window.location.href.replace("https://quick-ticket.herokuapp.com/", "");
    //If this is the team page load response
    const container = document.getElementById('team-card-container');
    if (res == "Not on a team") {
        container.innerHTML += `
        <div class="jumbotron" style="animation: animate-on-load .75s ease-in-out;
        transform-origin: left;">
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
        if (Array.isArray(res)) {
            let container = document.getElementsByClassName('container');
            console.log(res)
            let title;
            if (res.length == 1) {
                title = 'You have been invited to a team!'
            } else title = 'You have received multiple team invitations!'
            container[0].insertAdjacentHTML('afterbegin', 
                `
            <div class="col-sm-auto">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">`+ title + `</h5>
                        <div id="team-invite-btn" style="background-color: #f7f7f7;">
                        </div>
                    </div>
                </div>
            </div>
            `);
            let inviteContainer = document.getElementById('team-invite-btn');
            for(let i=0; i<res.length; i++){
                inviteContainer.innerHTML +=
                    `
                    <div style="display: flex; flex-direction: row; justify-content: right;">
                        <span>`+res[i].team_name +`
                        <a class="btn" onclick="teamInviteResponse(true, `+res[i]+`)" role="button" style=" margin-left: 1em; background-color: green; margin: .25em; width: auto; line-height: 32.5px !important;"><i class="bi bi-check" style="color: white; font-weight: bolder; font-size: 1.5em;"></i></a>
                        <a class="btn" onclick="teamInviteResponse(false, `+res[i]+`)" role="button" style="background-color: red; margin: .25em; width: auto; line-height: 32.5px !important;"><i class="bi bi-x" style="color: white; font-weight: bolder; font-size: 1.5em;"></i></a></span>
                    </div>
                    `
            }
        } else {
            let count = document.getElementById('ticket-count');
            count.innerHTML = res;
        }
    }
    if (active == 'team') {
        //Admin deleted team
        if (res == "Team deleted") {
            alert(res);
            window.location.reload();
            return;
        }
        //Admin successfully left team
        if (res.includes('Admin privileges')) {
            alert(res);
            window.location.reload();
            return;
        }
        //Non-admin leaving team
        if (res.includes('You successfully left')) {
            let teamName = res.slice(21);
            alert('Successfully left the following team: ' + teamName);
            window.location.reload();
            return;
        }
        //Admin leaving team
        if (res.includes('Members')) {
            let arr = res.slice(12).split(',');
            console.log(arr)
            //If the admin is the only member of the team
            if (arr.length == 2) {
                alert('You are the only member of this team - just delete it!')
                return;
            }
            //Remove current user as option because they're the admin
            //if i'm leaving a team I can't transfer privileges to myself
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
                    <input type="radio" id="option-`+ i + `" class="new-admin-inputs" value="` + arr[i] + `" name="new-admin">
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

        //On page load
        if (!res.includes('New admin') && !res.includes('User deleted')) {
            for (let i = 0; i < res.length; i++) {
                container.innerHTML += `
                    <div class="col-sm">
                    <div class="team-info">
                    <div class="card" id="team-card"style="width: 18rem; animation: animate-on-load .75s ease-in-out;
                    transform-origin: left;">
                    <div class="card-header" style="font-weight: bolder;">
                    <i class="fs-4 bi-people" style="margin-right: .25em;"></i><span class="team-name-span">
                        `+ res[i].team_name + `
                    </span></div>
                    <ul class="list-group list-group-flush index-`+ i + `">
                        <li class="list-group-item" id="team-code" >Invitation Code: <span style="font-weight: 300;">`+ res[i].team_code + `</span> <i class="bi bi-send-plus" style="color: #ccc; float: right; cursor: pointer; margin: auto;" onMouseOver="this.style.color='black'"; onMouseOut="this.style.color='#ccc'"; onClick="inviteNewMember(` + i + `);"></i></li>
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
            //remove animation from team cards after animation has completed
            const elements = document.getElementsByClassName('card');
            for (let i = 0; i < elements.length; i++) {
                elements[i].addEventListener("animationend", () => {
                    elements[i].style.animation = "none";
                })
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
            const container = document.getElementById('new-ticket-container');
            if (res.length == 1) {
                const breadcrumb = document.getElementById('breadcrumb-container');
                breadcrumb.style.display = "none"

                container.innerHTML +=
                    `
                <div class="jumbotron" style="animation: animate-on-load .75s ease-in-out;
                transform-origin: left;">
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
            container.innerHTML +=
                `
            <form style="animation: animate-on-load .55s ease-in-out;
            transform-origin: right; position: relative; top: 2em;">
            <div class="form-group" id="team-select">

            </div>
            <div class="form-group">
                <label for="exampleFormControlInput1">Ticket Title</label>
                <input type="text" name="ticketTitle" class="form-control" id="ticketTitle"
                    placeholder="Issue with promise in app.js" required>
            </div>
            <div class="form-group">
                <label for="exampleFormControlSelect1">Priority Level</label>
                <select class="form-control" name="ticketPriority" id="ticketPriority" required>
                    <option>Low</option>
                    <option selected>Normal</option>
                    <option>High</option>
                </select>
            </div>
            <div class="form-group">
                <label for="exampleFormControlTextarea1">Ticket Description</label>
                <textarea class="form-control" name="ticketDesc" id="ticketDesc" rows="3"
                    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    required></textarea>
            </div>
            <div class="form-group">
                <button class="btn" onClick="newTicket();">Create</button>
            </div>
        </form>
            `
            let teamSelectContainer = document.getElementById('team-select');
            //remove 'team_names' from arr, that only served to show there are multiple teams
            console.log(res);
            res.shift();
            console.log(res);
            teamSelectContainer.innerHTML +=
                `<div class="form-group" style="animation: animate-on-load .5s ease-in-out;
                transform-origin: right;">
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
                <div class="jumbotron" style="animation: animate-on-load .75s ease-in-out;
                transform-origin: left;">
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

            for (let i = 0; i < res.length; i++) {
                //Remove quotations at start and end of title/description/priority
                //Remove backslashes used to escape route params 
                res[i].ticket_title = res[i].ticket_title.slice(1, -1);
                res[i].ticket_title = res[i].ticket_title.replace(/\\(['"%<>&#])/g, '$1');
                res[i].ticket_desc = res[i].ticket_desc.slice(1, -1);
                res[i].ticket_desc = res[i].ticket_desc.replace(/\\(['"%<>&#])/g, '$1');
                res[i].ticket_priority = res[i].ticket_priority.slice(1, -1);
                //Convert UTC timestamps to local time in readable format
                if (res[i].creation_date !== null) {
                    let creationDate = new Date(res[i].creation_date);
                    let dateString = creationDate.toString().split(' ').slice(0, 4).toString().replaceAll(',', ' ');
                    //Current format is 'Fri Feb 03 2023'
                    //Change to 'Friday 02/03/23'
                    const options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit' };
                    res[i].creation_date = new Date(dateString).toLocaleDateString('en-US', options);
                }
                if (res[i].closed_date != null) {
                    let closedDate = new Date(res[i].closed_date);
                    let dateString = closedDate.toString().split(' ').slice(0, 4).toString().replaceAll(',', ' ');
                    const options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit' };
                    res[i].closed_date = new Date(dateString).toLocaleDateString('en-US', options);
                }
            }

            let container;
            let btnText;
            let status;
            let closedOrOpened;
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
                if (status == 'Open' || status == 'In Progress') {
                    closedOrOpened = 'Opened: ' + res[i].creation_date + '';
                } else if (status == 'Closed') {
                    closedOrOpened = 'Closed: ' + res[i].closed_date + '';
                }

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
                        <div class="card text-center" style="animation: animate-on-load .75s ease-in-out;
                        transform-origin: left;">
                            <div class="card-header">
                                <b>Ticket ID #`+ res[i].ticket_id + `</b> - <span class="text-muted">
                                `+ closedOrOpened + `
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
                        <div class="card text-center" style="animation: animate-on-load .75s ease-in-out;
                        transform-origin: left;">
                            <div class="card-header">
                                <b>Ticket ID #`+ res[i].ticket_id + `</b> - <span class="text-muted">
                                `+ closedOrOpened + `
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

        //Check if a ticket's closed/opened date was within the past month
        function isWithinPastMonth(dateString) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return false;
            }

            const currentDate = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(currentDate.getMonth() - 1);

            return date.getTime() >= lastMonth.getTime() && date.getTime() <= currentDate.getTime();
        }

        //Check if a ticket's closed/opened date was within the past week
        function isWithinPastWeek(dateString) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return false;
            }

            const currentDate = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(currentDate.getDate() - 7);

            return date.getTime() >= lastWeek.getTime() && date.getTime() <= currentDate.getTime();
        }

        //Need to move these inside the createMonthly/createWeekly chart functions

        var pastMonthOpened = [];
        var pastWeekOpened = [];
        var pastMonthClosed = [];
        var pastWeekClosed = [];
        //Get opened dates
        for (let i = 0; i < res[2].length; i++) {
            if (isWithinPastMonth(res[2][i].creation_date)) {
                pastMonthOpened.push(res[2][i].creation_date)
            }
            if (isWithinPastWeek(res[2][i].creation_date)) {
                pastWeekOpened.push(res[2][i].creation_date)
            }
        }
        //Tested this by setting a ticket's opened date to 1/3 (today is 2/6)
        //Seems to work as intended with a sample size of a whopping 1
        for (i = 0; i < res[2].length; i++) {
            if (res[2][i].closed_date != null) {
                if (isWithinPastMonth(res[2][i].closed_date)) {
                    pastMonthClosed.push(res[2][i].closed_date)
                }
                if (isWithinPastWeek(res[2][i].closed_date)) {
                    pastWeekClosed.push(res[2][i].closed_date)
                }
            }
        }

        function createWeeklyChart() {

            var topOfRange;

            if (pastWeekOpened.length >= pastWeekClosed.length) {
                topOfRange = pastWeekOpened.length * 1.25;
            } else {
                topOfRange = pastWeekClosed.length * 1.25;
            }

            //To deal with zero values in tickets opened/closed
            let calcOpened;
            let calcClosed;

            if (pastWeekOpened.length === 0) {
                calcOpened = .1;
            } else {
                calcOpened = pastWeekOpened.length / topOfRange;
            }
            if (pastWeekClosed.length === 0) {
                calcClosed = .1;
            } else {
                calcClosed = pastWeekClosed.length / topOfRange;
            }

            //Create recent activity chart for actions completed in the past week
            const container = document.getElementById('chart-container');

            container.innerHTML +=
                `
                <div class="col-lg">
                <table class="charts-css bar show-heading show-labels" id="past-week-chart" style="margin: .5em auto .5em auto;">
                <caption>Past Week Statistics</caption>    
                <tbody>
                    <tr>
                    <th scope="row">
                    <i class="bi bi-circle" style="transform: scale(1.5)" data-toggle="tooltip"
                        data-placement="top" title="Tickets Opened"></i>
                    </th>
                        <td style="--color: #f56c68;--size: calc(` + calcOpened + `); margin-top: .25em; margin-bottom: .25em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;">` + pastWeekOpened.length + `&nbsp;&nbsp;</td>
                    </tr>
                    <tr>
                    <th scope="row"> <i class="bi bi-x-circle" style="transform: scale(1.5)"
                    data-toggle="tooltip" data-placement="top" title="Tickets Closed"></i>
                    </th>
                        <td style="--color: #87dd7f;--size: calc(` + calcClosed + `); margin-top: .25em; margin-bottom: .25em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;">` + pastWeekClosed.length + `&nbsp;&nbsp;</td>
                    </tr>
                    </tbody> 
                </table>
                </div>
                `;
        }

        function createMonthlyChart() {

            var topOfRange;

            if (pastMonthOpened.length >= pastMonthClosed.length) {
                topOfRange = pastMonthOpened.length * 1.25;
            } else {
                topOfRange = pastMonthClosed.length * 1.25;
            }

            let calcOpened;
            let calcClosed;

            if (pastMonthOpened.length === 0) {
                calcOpened = .1;
            } else {
                calcOpened = pastMonthOpened.length / topOfRange;
            }
            if (pastMonthClosed.length === 0) {
                calcClosed = .1;
            } else {
                calcClosed = pastMonthClosed.length / topOfRange;
            }

            //Create recent activity chart for actions completed in the past month
            const container = document.getElementById('chart-container');

            container.innerHTML +=
                `
                <div class="col-lg">
                <table class="charts-css bar show-heading show-labels" id="past-month-chart" style="margin: .5em auto .5em auto;">
                <caption>Past Month Statistics</caption>    
                <tbody>
                    <tr>
                    <th scope="row">
                    <i class="bi bi-circle" style="transform: scale(1.5)" data-toggle="tooltip"
                        data-placement="top" title="Tickets Opened"></i>
                    </th>
                        <td style="--color: #f56c68;--size: calc(` + calcOpened + `); margin-top: .25em; margin-bottom: .25em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;">` + pastMonthOpened.length + `&nbsp;&nbsp;</td>
                    </tr>
                    <tr>
                    <th scope="row"> <i class="bi bi-x-circle" style="transform: scale(1.5)"
                    data-toggle="tooltip" data-placement="top" title="Tickets Closed"></i>
                    </th>
                        <td style="--color: #87dd7f;--size: calc(` + calcClosed + `); margin-top: .25em; margin-bottom: .25em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;">` + pastMonthClosed.length + `&nbsp;&nbsp;</td>
                    </tr>
                    </tbody> 
                </table>
                </div>
                `;

        }

        function createAllTimeChart() {

            var topOfRange = Math.max(res[0].tickets_opened, res[0].tickets_closed, res[1]) * 1.25;

            let calcOpened;
            let calcClosed;
            let calcTotal;

            if (res[0].tickets_opened === 0) {
                calcOpened = .1;
            } else {
                calcOpened = res[0].tickets_opened / topOfRange;
            }
            if (res[0].tickets_closed === 0) {
                calcClosed = .1;
            } else {
                calcClosed = res[0].tickets_closed / topOfRange;
            }
            if (res[1] === 0) {
                calcTotal = .1;
            } else {
                calcTotal = res[1] / topOfRange;
            }

            //Create chart for all-time statistics :)
            const container = document.getElementById('chart-container');
            container.innerHTML +=
                `
                <div class="col-lg">
                    <table id="performance-chart" class="charts-css bar show-heading show-labels" style="margin: .5em auto .5em auto;">
                        <caption>All-Time Statistics</caption>
                        <tbody>
                            <tr>
                                <th scope="row">
                                    <i class="bi bi-tag" style="transform: scale(1.5)" data-toggle="tooltip"
                                        data-placement="top" title="My Tickets"></i>
                                </th>
                                <td id="hold-html" style="--color: #85bbff;--size: calc(` + calcTotal + `); margin-top: .1em; margin-bottom: .1em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;">` + res[1] + `&nbsp;&nbsp;</td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <i class="bi bi-circle" style="transform: scale(1.5)" data-toggle="tooltip"
                                        data-placement="top" title="Tickets Opened"></i>
                                </th>
                                <td id="open-html" style="--color: #8fdd7f; --size:calc(` + calcOpened + `); margin-top: .1em; margin-bottom: .1em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;"> ` + res[0].tickets_opened + `&nbsp;&nbsp;</td>
                            </tr>
                            <tr>
                                <th scope="row"> <i class="bi bi-x-circle" style="transform: scale(1.5)"
                                        data-toggle="tooltip" data-placement="top" title="Tickets Closed"></i>
                                </th>
                                <td id="closed-html" style="--color: #f56c68; --size: calc(` + calcClosed + `); margin-top: .1em; margin-bottom: .1em; border-top-right-radius: 10px; border-bottom-right-radius: 10px;">` + res[0].tickets_closed + `&nbsp;&nbsp;</td>
                            </tr> 
                        </tbody>
                    </table>
                </div>
            `;
        }
        createWeeklyChart();
        createMonthlyChart();
        createAllTimeChart();
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
    const oldAdmin = sessionStorage.getItem('user');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            const newAdmin = inputs[i].value;
            console.log(newAdmin, id);
            let data = {
                "oldAdmin": oldAdmin,
                "newAdmin": newAdmin,
                "teamID": id
            }
            //Do AJAX request to transfer admin priv and delete old admin 
            ajaxFunc('/admin-transfer', "PUT", data)
            return;
        }
        //If user clicks confirm without checking a radio btn
        if (i == inputs.length - 1) {
            alert('You must select a new admin!')
            return;
        }
    }
}

//Should probably figure out how to use cookies so that you can't 
//edit/delete a user that is logged in on another tab or computer as well
window.onload = checkForUser(); setActiveLink();