<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	$query = 
			"select ssh_key, ssh_title
			from ssh where
			username = :username";

	$bindings = array(':username' => $_SESSION['username']);

	$courses = get_info($query, $bindings);

	header('Content-Type: application/json;charset=utf-8');
	echo json_success($courses);
?>
