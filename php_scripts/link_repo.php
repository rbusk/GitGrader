<?php
	include 'check_logged_in.php';
	include 'db_login.php';
	include 'json_functions.php';
	include 'database_functions.php';

	$ok = true;

	$query = "begin grader_pack.link_assignment(:username, :repo_id, :crn, :assignment_name); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':crn', $_POST['crn']);
	oci_bind_by_name($stmt, ':assignment_name', $_POST['assignment_name']);
	oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
	oci_bind_by_name($stmt, ':username', $_SESSION['username']);

	oci_execute($stmt);

	oci_close($conn);
?>
