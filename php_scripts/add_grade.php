<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	//check if post variable is set
	if (!isset($_POST['crn'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('CRN variable is not set');
	}
	elseif (!isset($_POST['assignment_name'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('assignment_name variable is not set');
	}
	elseif (!isset($_POST['grade'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('grade variable is not set');
	}
	elseif (!isset($_POST['student_username'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('student_username variable is not set');
	} else {

		//First need to make sure the signed-in user is a teacher of this class
		//if not then return failure message

		$query1 = 
				"select t.username, t.crn
				from teaches_course t
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
			echo json_error('User does not teach this course.');
			die();
		}

		//now make sure that the student takes this course

		$query2 = 
				"select t.username, t.crn
				from takes_course t
				where t.username = :username
				and t.crn = :crn";

		//could not get this to work with get_info for some reason :(
		include 'db_login.php';
		$stmt = oci_parse($conn, $query2);

		oci_bind_by_name($stmt, ':username', $_POST['student_username']);
		oci_bind_by_name($stmt, ':crn', $_POST['crn']);

		oci_execute($stmt);

		$courses = array();

		while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
			array_push($courses, $row);
		}

		oci_close($conn);
		
		if (count($courses) < 1) {
			header('Content-Type: application/json;charset=utf-8');
			echo json_error('Student does not take this course.');
			die();
		}

		//make sure that the assignment exists
		$query3 = "select * 
			from assignment
			where assignment_name = :assignment_name
			and crn = :crn";
		$bindings3 = array(':crn' => $_POST['crn'], ':assignment_name' => $_POST['assignment_name']);
		
		include 'db_login.php';
		$stmt = oci_parse($conn, $query3);

		oci_bind_by_name($stmt, ':crn', $_POST['crn']);
		oci_bind_by_name($stmt, ':assignment_name', $_POST['assignment_name']);

		oci_execute($stmt);

		$assignments = array();

		while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
			array_push($assignments, $row);
		}

		oci_close($conn);

		if (count($assignments) < 1) {
			header('Content-Type: application/json;charset=utf-8');
			echo json_error('This assignment does not exist.');
			die();
		}

		$query4 = "begin grader_pack.add_grade(:crn, :assignment_name, :student_username, :teacher_username, :grade, :grade_comment); end;";

		include 'db_login.php';
		$stmt = oci_parse($conn, $query4);

		oci_bind_by_name($stmt, ':teacher_username', $_SESSION['username']);
		oci_bind_by_name($stmt, ':crn', $_POST['crn']);
		oci_bind_by_name($stmt, ':assignment_name', $_POST['assignment_name']);
		oci_bind_by_name($stmt, ':student_username', $_POST['student_username']);
		oci_bind_by_name($stmt, ':grade', $_POST['grade']);
		oci_bind_by_name($stmt, ':grade_comment', $_POST['grade_comment']);

		oci_execute($stmt);

		oci_close($conn);
			
	}
?>
