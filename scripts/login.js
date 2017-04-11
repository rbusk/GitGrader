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
	});
	$("#loginButton").click(function(){
		console.log('pressed login button');
	});
});

function init() {
	// start with sign up div
	$('#login').hide();
	$('#signUp').show();
}
