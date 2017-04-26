<?php
	function json_error($msg) {
		return json_encode(array('success' => false, 'error'=> array('message' => $msg)), JSON_PRETTY_PRINT);
	}

	function json_error_with_code($msg, $code) {
		return json_encode(array('success' => false, 'error'=> array('message' => $msg, 'code' => $code)),JSON_PRETTY_PRINT);
	}

	function json_success($payload) {
		return json_encode(array('success' => true, 'payload' => $payload),JSON_PRETTY_PRINT);
	}
?>
