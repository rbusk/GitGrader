$( document ).ready(function() {
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
});

function init() {
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

	var first = $("#signup_first").val();
	var last = $("#signup_last").val();
	var username = $("#signup_username").val();
	var email = $("#signup_email").val();
	var password = $("#signup_password").val();

	
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
