<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	//check if post variable is set
	if (!isset($_POST['crn'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('CRN variable is not set');
	} else {

		//First need to make sure the signed-in user is a teacher of this class
		//if not then return failure message

		$query1 = 
				"select t.username, t.crn
				from teaches_course t
				where t.username = :username
				and t.crn = :crn";

		include 'db_login.php';
		$stmt = oci_parse($conn, $query1);

		oci_bind_by_name($stmt, ':username', $_SESSION['username']);
		oci_bind_by_name($stmt, ':crn', $_POST['crn']);

		oci_execute($stmt);

		$courses = array();

		while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
			array_push($courses, $row);
		}

		oci_close($conn);

		if (count($courses) < 1) {
			header('Content-Type: application/json;charset=utf-8');
			echo json_error('User does not teach this course.');
		} else {
			$bindings2 = array(':crn' => $_POST['crn']);
			$query2 =
				"select username
				from takes_course
				where crn = :crn";
				$resources = get_info($query2, $bindings2);

				header('Content-Type: application/json;charset=utf-8');
				echo json_success($resources);
		}
	}
?>
