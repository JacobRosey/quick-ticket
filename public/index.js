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

    //If on login or register page, don't care about nav stuff
    //because it's not visible on screen
    if (active !== 'login' && active !== 'register') {
        let text = document.getElementById(active);
        text.style.fontWeight = 'bold';
        if (active !== 'home') {
            document.getElementById('home').style.fontWeight = 'normal'
        }

        if (active.includes('ticket')) {
            document.getElementById('tickets').style.textDecoration = "underline"
            let navLink = document.getElementById('submenu1');
            navLink.className = "nav flex-column ms-1 collapse show";
            navLink.setAttribute("aria-expanded", "true");
            return;
        }
        if(active == 'team'){
            let user = sessionStorage.getItem('user');
            console.log('Starting ajaxfunction on team page load')
            ajaxFunc('/team/'+user+'', GET, user);
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

    if(code == ''){
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
                default: console.log(response);return response;
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
    xhr.onerror = () => {
        console.log("Something went wrong")
    }
}

//Should probably figure out how to use cookies so that you can't 
//edit/delete a user that is logged in on another tab or computer as well
window.onload = checkForUser(); setActiveLink();