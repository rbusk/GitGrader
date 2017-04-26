<?php
	include 'database_functions.php';
	include 'json_functions.php';
	include 'db_login.php';

	$query1 = "select username from takes_course where crn = :crn";

	$stmt = oci_parse($conn, $query1);

	oci_bind_by_name($stmt, ':crn', $_POST['crn']);

	oci_execute($stmt);

	$students = array();

	while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
		array_push($students, $row);
	}
	$grades = array();
	$class_grades = array();
	foreach($students as $value) {
		unset($grades);
		$grades = array();
		$query = "select assignment_name, grade, grade_comment, repo_id
							from submission
							where crn = :crn and student_username= :username";
		$stmt = oci_parse($conn, $query);
		oci_bind_by_name($stmt, ':crn', $_POST['crn']);
		oci_bind_by_name($stmt, ':username', $value["USERNAME"]);
		oci_execute($stmt);
		while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
			array_push($grades, $row);
		}
		$class_grades[$value["USERNAME"]] = $grades;
	}
	


	oci_close($conn);
	header('Content-Type: application/json;charset=utf-8');
	echo json_success($class_grades);
?>
