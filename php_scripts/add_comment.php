<?php
	include 'check_logged_in.php';
	include 'db_login.php';

	echo $_POST['repo_id'];

	$query = "begin grader_pack.add_comment(:repo_id, :file_path, :commenter_id, :content); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':commenter_id', $_SESSION['username']);
	oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
	oci_bind_by_name($stmt, ':file_path', $_POST['file_path']);
	oci_bind_by_name($stmt, ':content', $_POST['content']);

	oci_execute($stmt);

	oci_close($conn);
?>
