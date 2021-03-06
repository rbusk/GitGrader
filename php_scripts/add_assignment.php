<?php
	include 'check_logged_in.php';
	include 'db_login.php';
	include 'json_functions.php';
	include 'database_functions.php';


	$stmt = oci_parse($conn, 'set nls_date_format = "dd month, yyyy"');
	oci_execute($stmt);
	$ok = true;

	if (!isset($_POST['crn'])) {
		echo(json_encode('crn variable is not set'));
		$ok = false;
	}
	if (!isset($_POST['assignment_name'])) {
		echo(json_encode('assignment_name variable is not set'));
		$ok = false;
	}

	$target_dir = "../classes/" . $_POST['crn'] . "/assignments/";

	$target_file = $target_dir . $_POST['assignment_name'];

	$message = "";

	if ($ok) {
		$message = upload_file($_FILES['file'], $target_file);
	}

	if ($message == "success")  {
		$due_date = null;

		if (isset($_POST['due_date'])) {
			$due_date = $_POST['due_date'];
		}
		$query = "begin grader_pack.add_assignment(:crn, :assignment_name, :due_date, :outof, :weight); end;";

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
