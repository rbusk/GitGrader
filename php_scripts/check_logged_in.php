<?php
	session_start();
	if (!isset($_SESSION)) {
		header('Location: http://34.208.159.24:8171/GitGrader/login.html');
		die();
	}
	if (!isset($_SESSION['username'])) {
		header('Location: http://34.208.159.24:8171/GitGrader/login.html');
		die();
	}
?>
