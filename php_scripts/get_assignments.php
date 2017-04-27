<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	//check if post variable is set
	if (!isset($_POST['crn'])) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('CRN variable is not set');
	} else {

		//First need to make sure the signed-in user is a teacher or student of this class
		//if not then return failure message

		$query1 = 
			"select * from
			(
				select t.username, t.crn
				from teaches_course t
				where t.username = :username
				and t.crn = :crn
			)
			union
			(
				select t.username, t.crn
				from takes_course t
				where t.username = :username
				and t.crn = :crn
			)";

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
			echo json_error('User does not teach or take this course.');
		} else {
			$bindings2 = array(':crn' => $_POST['crn']);
			$query2 =
				"select *
				from assignment
				where crn = :crn";
				$assignments = get_info($query2, $bindings2);

				//loop through assignments and add path
				for($i=0; $i<count($assignments); $i++) {
					$path = 'GitGrader/classes/' . $_POST['crn'] . '/assignments/';
					$path .= $assignments[$i]['ASSIGNMENT_NAME'];
					if (file_exists('../../' . $path)) {
						$assignments[$i]['PATH'] = $path;
					}
				}

				header('Content-Type: application/json;charset=utf-8');
				echo json_success($assignments);
		}
	}
?>
