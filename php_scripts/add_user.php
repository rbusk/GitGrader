<?php
	include 'db_login.php';

	$query = "begin grader_pack.add_user(:username, :email, :first_name, :last_name); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':username', $_POST['username']);
	oci_bind_by_name($stmt, ':email', $_POST['email']);
	oci_bind_by_name($stmt, ':first_name', $_POST['first_name']);
	oci_bind_by_name($stmt, ':last_name', $_POST['last_name']);

	oci_execute($stmt);

	oci_close($conn);

	$_SESSION['username'] = $_POST['username'];
?>
