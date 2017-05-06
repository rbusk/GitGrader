<?php
	include 'db_login.php';
	include 'json_functions.php';
	include 'database_functions.php';

	$query = "select username from site_user"; 

	$bindings = [];
	$users = get_info($query, $bindings);

	$usernames = [];
	header('Content-Type: application/json;charset=utf-8');
	foreach($users as $user) {
		$usernames[$user['USERNAME']]=null;
	}
	echo json_success($usernames);
?>
