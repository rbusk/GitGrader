<?php
	include 'check_logged_in.php';
	include 'db_login.php';

	$query = "begin grader_pack.add_course(:crn, :course_no, :dept, :course_name, :username); end;";
	$path = "../classes/" . $_POST['crn'];
	mkdir($path,0755);
	mkdir($path . "/resources",0755);
	mkdir($path . "/assignments",0755);

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':crn', $_POST['crn']);
	oci_bind_by_name($stmt, ':course_no', $_POST['course_no']);
	oci_bind_by_name($stmt, ':dept', $_POST['dept']);
	oci_bind_by_name($stmt, ':course_name', $_POST['course_name']);
	oci_bind_by_name($stmt, ':username', $_SESSION['username']);

	oci_execute($stmt);

	oci_close($conn);
?>
