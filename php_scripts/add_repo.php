<?php
	include 'check_logged_in.php';
	include 'db_login.php';
	include 'VersionControl/Git.php';

	$path = '/home/ec2-user/git_repos/'.$_POST["username"].'/'.$_POST["repo"].'.git';
	$local_path = 'git_repos/' . $_POST["username"];
	$full_path = '/home/ec2-user/apache/htdocs/' . $local_path;
	mkdir($path,0755,true);
	mkdir($full_path,0755,true);
	$git = new VersionControl_Git($path);
	$git->initRepository(true);
	$instance = new VersionControl_Git($full_path);
	$instance->createClone('ec2-user@34.208.159.24:'.$path);

	
	$query = 'begin grader_pack.add_repo(:username, :repo, :path, :description); end;';

	$p = $local_path.'/'.$_POST["repo"];
	$stmt = oci_parse($conn, $query);
	oci_bind_by_name($stmt, ':username', $_SESSION['username']);
	oci_bind_by_name($stmt, ':repo', $_POST['repo']);
	oci_bind_by_name($stmt, ':path', $p);
	oci_bind_by_name($stmt, ':description', $_POST['description']);
	oci_execute($stmt);

	oci_close($conn);
?>
