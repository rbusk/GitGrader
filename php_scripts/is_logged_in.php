<?php
	include 'json_functions.php';

	session_start();

	header('Content-Type: application/json;charset=utf-8');
	if (isset($_SESSION['username'])) {
		echo json_success(array('logged_in' => true));
	} else {
		echo json_success(array('logged_in' => false));
	}
?>
