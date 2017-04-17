<?php
	include 'check_logged_in.php';
	include 'db_login.php';

	$due_date = null;
	$query = "begin grader_pack.add_assignment(:crn, :assignment_name, :due_date, :outof, :weight); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':crn', $_POST['crn']);
	oci_bind_by_name($stmt, ':assignment_name', $_POST['assignment_name']);
	oci_bind_by_name($stmt, ':due_date', $due_date);
	oci_bind_by_name($stmt, ':outof', $_POST['outof']);
	oci_bind_by_name($stmt, ':weight', $_POST['weight']);

	oci_execute($stmt);

	oci_close($conn);
?>
