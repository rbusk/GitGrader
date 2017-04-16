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
?>
