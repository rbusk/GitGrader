<?php
	include 'check_logged_in.php';
	include 'db_login.php';
	include 'json_functions.php';
	include 'database_functions.php';

	$ok = true;

	if (!isset($_POST['crn'])) {
		echo(json_encode('crn variable is not set'));
		$ok = false;
	}
	if (!isset($_POST['resource_name'])) {
		echo(json_encode('resource_name variable is not set'));
		$ok = false;
	}

	$target_dir = "../classes/" . $_POST['crn'] . "/resources/";

	$target_file = $target_dir . $_POST['resource_name'];

	if ($ok) {
		$message = upload_file($_FILES['file'], $target_file);
	}

	if ($message == "success")  {
		$due_date = null;
		$query = "begin grader_pack.add_resource(:crn, :resource_name); end;";

		$stmt = oci_parse($conn, $query);

		oci_bind_by_name($stmt, ':crn', $_POST['crn']);
		oci_bind_by_name($stmt, ':resource_name', $_POST['resource_name']);

		oci_execute($stmt);

		oci_close($conn);
	}
?>
