<?php
	include 'check_logged_in.php';
	include 'database_functions.php';
	include 'json_functions.php';

	$query1 = 
		"select R.repo_id, R.repo_name, R.repo_path, R.description, s.crn, s.assignment_name	
			from 
			( 
				select r.repo_name, r.repo_path, r.description, r.repo_id 
				from repo r, contributor c 
				where r.repo_id = c.repo_id and c.username = :username
			) R
			left join 
			submission s
			on R.repo_id = s.repo_id";

	include 'db_login.php';
	$stmt = oci_parse($conn, $query1);

	oci_bind_by_name($stmt, ':username', $_SESSION['username']);

	oci_execute($stmt);

	$repos = array();

	while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
		array_push($repos, $row);
	}

	oci_close($conn);
	header('Content-Type: application/json;charset=utf-8');
	echo json_success($repos);
?>