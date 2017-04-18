<?php
	include 'check_logged_in.php';
	include 'db_login.php';

	$due_date = null;
	$query = "begin grader_pack.add_teaches_course(:username, :crn); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':crn', $_POST['crn']);
	oci_bind_by_name($stmt, ':username', $_POST['username']);

	oci_execute($stmt);

	oci_close($conn);
?>
