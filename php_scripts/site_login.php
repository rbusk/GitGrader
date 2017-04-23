<?php
	include 'db_login.php';

	$query = "begin grader_pack.get_user(:email, :username); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':email', $_POST['email']);
	oci_bind_by_name($stmt, ':username', $username, 30);

	oci_execute($stmt);

	echo($username);

	oci_close($conn);

	if ($username != null) {
		session_start();
		$_SESSION['username'] = $username;
	}
?>
