<?php
	include 'db_login.php';
	$query1 = "select repo_path from repo where repo_id = :id";

	$stmt = oci_parse($conn, $query1);

	oci_bind_by_name($stmt, ':id', $_POST['repo_id']);

	oci_execute($stmt);
	$repo_path = oci_fetch_array($stmt, OCI_ASSOC);
	var_dump($repo_path);
	$repo_path = $repo_path['REPO_PATH'];
	echo $repo_path;

	$cwd = getcwd();


	$beginning = '/home/ec2-user/apache/htdocs/';
	//$path = '/home/ec2-user/apache/htdocs/git_repos/rbusk/hello';
	$path = $beginning.$repo_path;
	echo $path;
	chdir($path);
	exec('git pull');
	chdir($cwd);


?>
