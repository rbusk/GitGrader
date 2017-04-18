<?php
	include 'db_login.php';

	$query = "begin grader_pack.get_user(:username, :email); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':username', $_POST['username']);
	oci_bind_by_name($stmt, ':email', $email, 30);

	oci_execute($stmt);

	oci_close($conn);

	if ($email != null) {
		session_start();
		$_SESSION['username'] = $_POST['username'];
	}
	include 'redirect_to_index.php'
?>
