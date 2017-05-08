<?php
	include 'db_login.php';
	include 'check_logged_in.php';

	$authorized_keys = fopen('/home/ec2-user/.ssh/authorized_keys','a+');
	fwrite($authorized_keys,$_POST["ssh_key"]."\n");
	

	
	$query = 'begin grader_pack.add_ssh_key(:username, :ssh_key, :ssh_title); end;';

	$stmt = oci_parse($conn, $query);
	$stmt = oci_parse($conn, $query);
	oci_bind_by_name($stmt, ':username', $_SESSION['username']);
	oci_bind_by_name($stmt, ':ssh_key', $_POST['ssh_key']);
	oci_bind_by_name($stmt, ':ssh_title',$_POST['ssh_title']);
	oci_execute($stmt);

	oci_close($conn);

	echo("ssh key added");
?>
