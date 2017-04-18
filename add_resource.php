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

	$target_dir = "resources/";

	//file name will be [CRN]-[RESOURCE-NAME]
	$target_file = $target_dir . $_POST['crn'] . '-' . $_POST['resource_name'];

	if ($ok) {
		$message = upload_file($_FILES['file'], $target_file);
	}

	if ($message == "success")  {

		$query = "insert into resources values()";

		$stmt = oci_parse($conn, $query);

		oci_bind_by_name($stmt, ':crn', $_POST['crn']);
		oci_bind_by_name($stmt, ':assignment_name', $_POST['assignment_name']);
		oci_bind_by_name($stmt, ':due_date', $due_date);
		oci_bind_by_name($stmt, ':outof', $_POST['outof']);
		oci_bind_by_name($stmt, ':weight', $_POST['weight']);

		oci_execute($stmt);

		oci_close($conn);
	}
?>
