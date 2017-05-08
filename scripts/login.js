$.post("GitGrader/php_scripts/is_logged_in.php",
	{
		email: $('#login_email').val()
	},
	function(data, status) {
		if (data['payload']['logged_in'] == false) {
			$( document ).ready(ready);
		} else {
			// handle main content
			$('#loginContent').hide();
			$('#loggedInMainContent').show();
			
			// handle nav bar content
			$('#loginNav').hide();
			$('#normalNav').show();
		}
	}
);


function ready() {
	
	// materialize
	$('.modal').modal();

	init();

	// handle nav bar stuff
	$(".signUpNav").click(function(){
		$("#signUp").show();
		$('#login').hide();
	});
	$(".loginNav").click(function(){
		$("#login").show();
		$('#signUp').hide();
	});
	$(".logoutNav").click(function(){
		logoutUser();
	});

	//button click handlers
	$("#signUpButton").click(function(){
		createUser();
	});
	$("#loginButton").click(function(){
		loginUser();	
	});
}

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
	var first = $("#signup_first").val();
	var last = $("#signup_last").val();
	var username = $("#signup_username").val();
	var email = $("#signup_email").val();
	var password = $("#signup_password").val();

	if (!first) {
		$("#errorMessage").html("Please enter a first name.");
		$("#errorModal").modal('open');
		return;
	}

	if (!last) {
		$("#errorMessage").html("Please enter a last name.");
		$("#errorModal").modal('open');
		return;
	}

	if (!username) {
		$("#errorMessage").html("Please enter a username.");
		$("#errorModal").modal('open');
		return;
	}

	if (!email) {
		$("#errorMessage").html("Please enter an email.");
		$("#errorModal").modal('open');
		return;
	}

	if (!password) {
		$("#errorMessage").html("Please enter a password.");
		$("#errorModal").modal('open');
		return;
	}

	// check if passwords match
	if (!doPasswordsMatch()) {
		$("#errorMessage").html("Passwords do not match!");
		$("#errorModal").modal('open');
		return;
	}

	// are passwords long enough
	if (!isPasswordLongEnough()) {
		$("#errorMessage").html('password must be at least 6 characters long');
		$("#errorModal").modal('open');
		return;
	}


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
		$("#login").show();
		$('#signUp').hide();
		// TODO if Firebase successful, create user with PHP
	}
};

function loginUser() {

	var email = $("#login_email").val();
	var password = $("#login_password").val();
	
	if (!email) {
		$("#errorMessage").html("Please enter an email.");
		$("#errorModal").modal('open');
		return;
	}

	if (!password) {
		$("#errorMessage").html("Please enter a password.");
		$("#errorModal").modal('open');
		return;
	}

	// attempt Firebase login 
	loginUserInFB(email, password);
	
	// check if Firebase sign up worked
	/*if (!isUserLoggedIntoFB()) {
		alert('account login failed!');
		//return;
	}
	else {
		alert('successfully logged in!');
	}*/

	//isUserLoggedIntoFB();

	// TODO if Firebase successful, get user info from PHP
/*	$.post("GitGrader/php_scripts/site_login.php",
		{
			email: $('#login_email').val()
		},
		function(data, status) {
		}
	);
	*/
	//window.open("index.html");
	
	// handle main content
	/*$('#loginContent').hide();
	$('#loggedInMainContent').show();
	
	// handle nav bar content
	$('#loginNav').hide();
	$('#normalNav').show();
	*/
};





// Firebase Auth //////////////////////////////////////
/*function isUserLoggedIntoFB() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			alert('logged in');
			// handle main content
			$('#loginContent').hide();
			$('#loggedInMainContent').show();
			
			// handle nav bar content
			$('#loginNav').hide();
			$('#normalNav').show();
			return true;
		} else {
			alert('account login failed');
			return false;
		}
	});
}*/

function loginUserInFB(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password)
	.then(function(firebaseUser) {
		$.post("GitGrader/php_scripts/site_login.php",
			{
				email: $('#login_email').val()
			},
			function(data, status) {
				location.reload();
			}
		);
	})
	.catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		alert('error logging in');
	});
}

function createUserInFB(email, password) {
	var success = true;
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(function() {
		$.post('GitGrader/php_scripts/add_user.php', $('#addUserForm').serialize()).then(function() {
			location.reload();
			return true;
		});
	})
	.catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		return false;
	});
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
