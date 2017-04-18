<?php
	include 'db_login.php';
	require_once 'VersionControl/Git.php';

	$repo_path = '/home/ec2-user/git_repos/'.$_POST["username"].'/'.$_POST["repo"].'.git';
	mkdir($repo_path,0755,true);
	$git = new VersionControl_Git($repo_path);
	$git->initRepository(true);

	
	$query = 'begin grader_pack.add_repo(:username, :repo); end;';

	$stmt = oci_parse($conn, $query);
	$stmt = oci_parse($conn, $query);
	oci_bind_by_name($stmt, ':username', $_POST['username']);
	oci_bind_by_name($stmt, ':repo', $_POST['repo']);
	oci_execute($stmt);

	oci_close($conn);

	echo("added repo.");
?>
