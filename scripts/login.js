$( document ).ready(ready);

function ready() {
	console.log("ready!");
	// materialize
	$('.modal').modal();

	init();

	// handle nav bar stuff
	$(".signUpNav").click(function(){
		console.log('pressed sign up in nav bar');
		$("#signUp").show();
		$('#login').hide();
	});
	$(".loginNav").click(function(){
		console.log('pressed login in nav bar');
		$("#login").show();
		$('#signUp').hide();
	});
	$(".logoutNav").click(function(){
		console.log('pressed logout in nav bar');
		logoutUser();
	});

	//button click handlers
	$("#signUpButton").click(function(){
		console.log('pressed sign up button');
		createUser();
	});
	$("#loginButton").click(function(){
		console.log('pressed login button');
		loginUser();	
	});
}

function init() {
	console.log("initializing");

	// start with sign up div
	$('#login').hide();
	$('#signUp').show();

	// handle main content
	$('#loginContent').show();
	$('#loggedInMainContent').hide();

	// put login stuff in nav bar
	$('#loginNav').show();
	$('#normalNav').hide();
}

function isPasswordLongEnough() {
	var p1 = $("#signup_password").val();
	if (p1.length < 6) {
		return false;
	}
	return true;
}

function doPasswordsMatch() {
	var p1 = $("#signup_password").val();
	var p2 = $("#signup_password_2").val();

	if (p1 === p2) {
		return true;
	}
	return false;
}

function usernameTaken(username) {
	// TODO
	return false;
}

function notRealEmail(email) {
	var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i

	if(!pattern.test(email)) {
		return true; // bad email
	}
	return false; // good email
}

function createUser() {
	// check if passwords match
	if (!doPasswordsMatch()) {
		alert("Passwords do not match!");
		return;
	}

	// are passwords long enough
	if (!isPasswordLongEnough()) {
		alert('password must be at least 6 characters long');
		return;
	}

	var first = $("#signup_first").val();
	var last = $("#signup_last").val();
	var username = $("#signup_username").val();
	var email = $("#signup_email").val();
	var password = $("#signup_password").val();

	// make sure email is good
	if (notRealEmail(email)) {
		alert("bad email");
		return
	}
	
	// check if this username exists already
	/*
	if (usernameTaken) {
		alert('This username is taken!');
		return;
	}
	*/

	// attempt Firebase sign up
	var didCreateUser = false;
	didCreateUser = createUserInFB(email, password);

	// if worked, show login div
	if (didCreateUser) {
		alert('successfully created user!');
		$("#login").show();
		$('#signUp').hide();
		// TODO if Firebase successful, create user with PHP
	}
	else {
		alert('did not successfully create user');
	}

};

function loginUser() {
	console.log("logging in user");

	var email = $("#login_email").val();
	var password = $("#login_password").val();

	// attempt Firebase login 
	loginUserInFB(email, password);
	
	// check if Firebase sign up worked
	if (!isUserLoggedIntoFB) {
		alert('account login failed!');
		return;
	}
	else {
		alert('successfully logged in!');
	}

	// TODO if Firebase successful, get user info from PHP
	
	//window.open("index.html");
	
	// handle main content
	$('#loginContent').hide();
	$('#loggedInMainContent').show();
	
	// handle nav bar content
	$('#loginNav').hide();
	$('#normalNav').show();

};





// Firebase Auth //////////////////////////////////////
function isUserLoggedIntoFB() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			return true;
		} else {
			return false;
		}
	});
}

function loginUserInFB(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("Error in logging user in:", error.code, error.message);
	});
}

function createUserInFB(email, password) {
	var success = true;
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("Error in creating user:", error.code, error.message);
		success = false;
	});
	return success;
}

function logoutUser() {
	console.log("logging out user");

	firebase.auth().signOut().then(function() {
		alert('logged out');
	}, function(error) {
		alert('error, could not log out');
	});
	
	// handle main content
	$('#loginContent').show();
	$('#loggedInMainContent').hide();
	
	// handle nav bar content
	$('#loginNav').show();
	$('#normalNav').hide();

	clearAllUserData();
}

function clearAllUserData() {
	// TODO
}
