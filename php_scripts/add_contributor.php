<?php
	include 'check_logged_in.php';
	include 'db_login.php';

	$due_date = null;
	$query = "begin grader_pack.add_contributor(:repo_id, :username); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
	oci_bind_by_name($stmt, ':username', $_POST['username']);

	oci_execute($stmt);

	oci_close($conn);
?>
