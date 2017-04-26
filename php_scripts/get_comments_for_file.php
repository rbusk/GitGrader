<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';
	include 'db_login.php';

	$query = 
			"select content, response, resolved, timestamp, commenter_id
			from comments where
			repo_id = :repo_id and file_path = :file_path";
	
	$stmt = oci_parse($conn, $query);	
	oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
	oci_bind_by_name($stmt, ':file_path', $_POST['file_path']);

	oci_execute($stmt);
	$comments = array();

	while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
		array_push($comments, $row);
	}

	oci_close($conn);
	header('Content-Type: application/json;charset=utf-8');
	echo json_success($comments);
?>
