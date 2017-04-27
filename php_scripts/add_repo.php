<?php
	include 'check_logged_in.php';
	include 'db_login.php';
	require_once 'VersionControl/Git.php';

	$local_path = 'git_repos/' . $_POST["username"].'/'.$_POST["repo"].'.git';
	$full_path = '/home/ec2-user/apache/htdocs/' . $local_path;
	mkdir($full_path,0755,true);
	$git = new VersionControl_Git($full_path);
	$git->initRepository(true);

	
	$query = 'begin grader_pack.add_repo(:username, :repo, :path, :description); end;';

	$stmt = oci_parse($conn, $query);
	oci_bind_by_name($stmt, ':username', $_SESSION['username']);
	oci_bind_by_name($stmt, ':repo', $_POST['repo']);
	oci_bind_by_name($stmt, ':path', $local_path);
	oci_bind_by_name($stmt, ':description', $_POST['description']);
	oci_execute($stmt);

	oci_close($conn);
?>
