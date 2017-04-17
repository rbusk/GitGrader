<?php
function get_info($query, $bindings) {
	include 'db_login.php';
	$cursor = oci_parse($conn, "ALTER SESSION SET NLS_DATE_FORMAT='YYYY-MM-DD'");
	oci_execute($cursor);

	$stmt = oci_parse($conn, $query);

	foreach ($bindings as $key => $value) {
		oci_bind_by_name($stmt, $key, $value);
	}

	oci_execute($stmt);

	$list = array();

	while($row = oci_fetch_array($stmt, OCI_ASSOC)) {
		array_push($list, $row);
	}	

	oci_close($conn);

	return $list;
}

function exec_procedure($query, $bindings) {
	include 'db_login.php';
	$stmt = oci_parse($conn, $query);

	foreach ($bindings as $key => $value) {
		oci_bind_by_name($stmt, $key, $value);
	}

	oci_execute($stmt);

	oci_close($conn);
}

function upload_file($file, $path) {
	$message = 'success';
	if (!move_uploaded_file($file["tmp_name"], $path)) {
		switch( $_FILES['file']['error'] ) {
				case UPLOAD_ERR_OK:
						break;
				case UPLOAD_ERR_INI_SIZE:
				case UPLOAD_ERR_FORM_SIZE:
						$message = 'file too large';
						break;
				case UPLOAD_ERR_PARTIAL:
						$message = 'file upload was not completed.';
						break;
				case UPLOAD_ERR_NO_FILE:
						$message = 'zero-length file uploaded.';
						break;
				default:
						$message = 'internal error #' . $file['error'];
						break;
		}
	}
	return($message);
}
?>
