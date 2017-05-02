<?php
	include 'check_logged_in.php';
	include 'json_functions.php';

	function sortFile($file1, $file2) {
		if ($file1['directory'] == true && $file2['directory'] == false) {
			return -1;
		}
		if ($file2['directory'] == true && $file1['directory'] == false) {
			return 1;
		}
		return strcmp($file1['filename'], $file2['filename']);
	}

	function dirToArray($full_path, $local_path) { 

		$result = array(); 

		$cdir = scandir($full_path); 
		foreach ($cdir as $key => $value) 
		{ 
			if (!in_array($value,array(".",".."))) 
			{ 
				if (is_dir($full_path . DIRECTORY_SEPARATOR . $value)) 
				{ 
					$result[] = array('filename' => $value, 'directory' => true, 'path' => $local_path . DIRECTORY_SEPARATOR . $value);
				} 
				else 
				{ 
					$result[] = array('filename' => $value, 'directory' => false, 'path' => $local_path . DIRECTORY_SEPARATOR . $value); 
				}	
			} 
		} 

		usort($result, "sortFile");

		return $result; 
	}
	
	$result_array = array();

	if (isset($_POST['repo_id'])) {

		include 'db_login.php';

		$query = "begin grader_pack.get_repo_path(:repo_id, :repo_path); end;";

		$stmt = oci_parse($conn, $query);

		oci_bind_by_name($stmt, ':repo_id', $_POST['repo_id']);
		oci_bind_by_name($stmt, ':repo_path', $repo_path, 100);

		oci_execute($stmt);

		oci_close($conn);

		$result_array['repo_path'] = $repo_path;

	} else if (isset($_POST['repo_path'])) {
		$repo_path = $_POST['repo_path'];
	}

	if ($repo_path != null) {
		header('Content-Type: application/json;charset=utf-8');
		$result_array['files'] = dirToArray('/home/ec2-user/apache/htdocs/' . $repo_path, $repo_path);
		echo json_success($result_array);
	} else {
		header('Content-Type: application/json;charset=utf-8');
		echo json_error('Path not found.');
	}
?>
