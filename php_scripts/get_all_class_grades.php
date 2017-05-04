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
		$query = "select a.assignment_name, s.grade, s.grade_comment, s.repo_id, a.weight, a.outof, s.teacher_username
							from assignment a left outer join
							( select * from submission where student_username = :username ) s
							on a.crn = s.crn and a.assignment_name = s.assignment_name
							where a.crn = :crn";

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
