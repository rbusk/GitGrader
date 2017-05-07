<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	$query = 'select * from (select username from teaches_course where crn=:crn) union (select username from takes_course where crn=:crn)';

	$bindings = array(':crn' => $_POST['crn']);

	$users = get_info($query, $bindings);

	if (in_array(array('USERNAME' => $_POST['username']), $users)) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_success(true);
	} else {
		header('Content-Type: application/json;charset=utf-8');
		echo json_success(false);
	}
?>
