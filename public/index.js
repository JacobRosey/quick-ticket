//Checks if user is logged in
function checkForUser(){
    let userN = document.getElementById('userN');
    let userDiv = document.getElementById('user-drop');
    var isLogged = sessionStorage.getItem('logged');
    var currentUser = sessionStorage.getItem('user');

    if(isLogged == true){
        userDiv.style.visibility = "visible"
        userN.innerHTML = currentUser; 
    } else {
        //userDiv.style.visibility = "hidden"
        userN.innerHTML = ""
    } 

}

function logOut(){
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

function joinTeam(){
    alert("Hello")
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
        ajaxFunc('/login/'+data.user+'/'+data.pass+'', "GET", data);
        checkForUser();
    }

}

function ajaxFunc(path, method, d){
    //If user is logging in; edit path to be like /login/user/pass
    /*if (method == 'GET') {
        path = path + "/" + d.user + "/" + d.pass + ""
    }*/
    let xhr = new XMLHttpRequest();
    xhr.open(method, path, true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    /* Probably going to need a put/delete request at some point
    if (method == 'PUT') {
        var data = JSON.stringify({
            "name": d.name,
            "pass": d.pass
        })

    } */

    if (method == 'GET') {
        console.log(path)
        var data = JSON.stringify({
            "user": "" + d.user + "",
            "pass": "" + d.pass + ""
        })
        console.log('This is a get request');
        xhr.send(data);
    }

    xhr.onload = () => {
        if (xhr.status == 200) {
            console.log('success');
        } else console.log('status ' + xhr.status)
        //State whether login was successful or not
        var response = xhr.responseText;
        if (response == "Login Successful!") {
            //Redirect to the home page after successful login
            window.location.replace('/home');
            alert(response);
            //Setup session storage
            sessionStorage.setItem('logged', true);
            sessionStorage.setItem('user', d.user);
        } 
        if (response == "Incorrect Password!") {
            alert(response)
            document.getElementById('loginPass').value = '';
        }
        if(response == "This username does not exist!"){
            alert(response);
        }
    }
    xhr.onerror = () => {
        console.log("Something went wrong")
    }
}

//Should probably figure out how to use cookies so that you can't 
//edit/delete a user that is logged in on another tab or computer as well
window.onload = checkForUser();