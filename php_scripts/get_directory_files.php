<?php
	include 'check_logged_in.php';
	include 'json_functions.php';

	function dirToArray($full_path, $local_path) { 

		$result = array(); 

		$cdir = scandir($full_path); 
		foreach ($cdir as $key => $value) 
		{ 
			if (!in_array($value,array(".",".."))) 
			{ 
				if (is_dir($full_path . DIRECTORY_SEPARATOR . $value)) 
				{ 
					$result[$value] = array('directory' => true, 'path' => $local_path . DIRECTORY_SEPARATOR . $value);
				} 
				else 
				{ 
					$result[$value] = array('directory' => false, 'path' => $local_path . DIRECTORY_SEPARATOR . $value); 
				}	
			} 
		} 

		return $result; 
	}

	if (isset($_POST['repo_id'])) {

		include 'db_login.php';

		$query = "begin grader_pack.get_repo_path(:repo_id, :repo_path); end;";

		$stmt = oci_parse($conn, $query);

		oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
		oci_bind_by_name($stmt, ':repo_path', $repo_path, 100);

		oci_execute($stmt);

		oci_close($conn);

	} else if (isset($_POST['repo_path'])) {
		$repo_path = $_POST['repo_path'];
	}

	if ($repo_path != null) {
		header('Content-Type: application/json;charset=utf-8');
		echo json_success(array('files' => dirToArray('/home/ec2-user/apache/htdocs/' . $repo_path, $repo_path)));
	} else {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('Path not found.');
	}
?>
