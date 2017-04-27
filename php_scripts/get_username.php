<?php
	session_start();
	include 'json_functions.php';

	header('Content-Type: application/json;charset=utf-8');
	if (isset($_SESSION['username'])) {
		echo json_success(array('username' => $_SESSION['username']));
	} else {
		echo json_error('user is not logged in');
	}

?>
