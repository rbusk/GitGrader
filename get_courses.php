<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	$query = 
		"select * from
		(
			select c.crn, c.course_no, c.dept, c.course_name, 'instructor' as role
			from teaches_course t, course c where
			username = :username
			and c.crn = t.crn
		)
		union
		(
			select c.crn, c.course_no, c.dept, c.course_name, 'student' as role
			from takes_course t, course c where
			username = :username
			and c.crn = t.crn
		)";

	$bindings = array(':username' => $_SESSION['username']);

	echo($_SESSION['username']);

	$courses = get_info($query, $bindings);

	header('Content-Type: application/json;charset=utf-8');
	echo json_success($courses);
?>
