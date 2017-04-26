<?php
	include 'check_logged_in.php';
	include 'json_functions.php';

	//Thanks to http://php.net/manual/en/function.scandir.php for dirToArray function
	function dirToArray($dir) { 

		$result = array(); 

		$cdir = scandir($dir); 
		foreach ($cdir as $key => $value) 
		{ 
			if (!in_array($value,array(".",".."))) 
			{ 
				if (is_dir($dir . DIRECTORY_SEPARATOR . $value)) 
				{ 
					$result[$value] = dirToArray($dir . DIRECTORY_SEPARATOR . $value); 
				} 
				else 
				{ 
					$result[] = $value; 
				}	
			} 
		} 

		return $result; 
	}

	include 'db_login.php';

	$query = "begin grader_pack.get_repo_path(:repo_id, :repo_path); end;";

	$stmt = oci_parse($conn, $query);

	oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
	oci_bind_by_name($stmt, ':repo_path', $repo_path, 100);

	oci_execute($stmt);

	oci_close($conn);

	if ($repo_path != null) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_success(dirToArray($repo_path));
	} else {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('Repo not found.');
	}
?>
