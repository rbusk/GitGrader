$( document ).ready(function() {
	// materialize
	$('.modal').modal();

	init();

	// handle nav bar stuff
	$("#signUpNav").click(function(){
		console.log('pressed sign up in nav bar');
		$("#signUp").show();
		$('#login').hide();
	});
	$("#loginNav").click(function(){
		console.log('pressed login in nav bar');
		$("#login").show();
		$('#signUp').hide();
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
});

function init() {
	// start with sign up div
	$('#login').hide();
	$('#signUp').show();

}


function doPasswordsMatch() {
	// TODO
	return true;
}

function usernameTaken(username) {
	// TODO
	return false;
}

function createUser() {
	// check if passwords match
	if (!doPasswordsMatch) {
		alert("Passwords do not match!");
		return;
	}

	var first = $("#signup_first").text();
	var last = $("#signup_last").text();
	var username = $("#signup_username").text();
	var email = $("#signup_email").text();
	var password = $("#signup_password").text();
	
	// check if this username exists already
	/*
	if (usernameTaken) {
		alert('This username is taken!');
		return;
	}
	*/

	// attempt Firebase sign up
	createUserInFB(email, password);

	// attempt to log into this new account
	loginUserInFB(email, password);

	// check if Firebase sign up worked
	if (!isUserLoggedIntoFB) {
		alert('account creation failed!');
		return;
	}
	else {
		alert('successfully logged in!');
	}

	// if Firebase successful, create user with PHP
};

function loginUser() {
	var username = $("#login_username").text();
	var password = $("#login_password").text();
	// TODO get email from username in PHP
	var email = 'mnelso12@nd.edu';

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

	// if Firebase successful, get user info from PHP
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
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("Error in creating user:", error.code, error.message);
	});
}
