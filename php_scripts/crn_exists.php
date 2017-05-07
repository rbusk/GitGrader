<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	$query =  "select crn from course";

	$bindings = array();

	$courses = get_info($query, $bindings);

	if (in_array(array('CRN' => $_POST['crn']), $courses)) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_success(true);
	} else {
		header('Content-Type: application/json;charset=utf-8');
		echo json_success(false);
	}
?>
