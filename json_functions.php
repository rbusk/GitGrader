<?php
	function json_error($msg) {
		return json_encode(array('success' => false, 'error'=> array('message' => $msg)));
	}

	function json_error_with_code($msg, $code) {
		return json_encode(array('success' => false, 'error'=> array('message' => $msg, 'code' => $code)));
	}

	function json_success($payload) {
		return json_encode(array('success' => true, 'payload' => $payload));
	}
?>
