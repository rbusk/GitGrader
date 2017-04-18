<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	//check if post variable is set
	if (!isset($_POST['crn'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('CRN variable is not set');
	} else {

		//First need to make sure the signed-in user is a student of this class
		//if not then return failure message

		$query1 = 
				"select t.username, t.crn
				from takes_course t
				where t.username = :username
				and t.crn = :crn";

		//could not get this to work with get_info for some reason :(
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
			echo json_error('User does not take this course.');
		} else {

			$query2 =
					"select a.assignment_name, s.teacher_username, s.grade, s.repo_name,
						a.outof, a.weight
					from assignment a left join submission s
					on a.crn = s.crn and a.assignment_name = s.assignment_name
					where a.crn = :crn
					and (s.student_username = :username or s.student_username is null)";

			include 'db_login.php';
			$stmt = oci_parse($conn, $query2);

			oci_bind_by_name($stmt, ':crn', $_POST['crn']);
			oci_bind_by_name($stmt, ':username', $_SESSION['username']);

			$grades = array();

			oci_execute($stmt);

			while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
				array_push($grades, $row);
			}

			oci_close($conn);

			header('Content-Type: application/json;charset=utf-8');
			echo json_success($grades);
		}
	}
?>
