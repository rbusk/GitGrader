$( document ).ready(function() {

	// no menu items selected initially, so hide right side content
	hideAll();

	// handle left menu switches
	$("#leftMenu .collection-item").click(function(){
		leftMenuSwitch(this.id);
	});

});

function leftMenuSwitch(selectedItem) {
	if (selectedItem === "grades") {
		console.log("grades");
		hideAll();
		$("#gradesDiv").show();
	}
	else if (selectedItem === "assignments") {
		console.log("assignments");
		hideAll();
		$("#assignmentsDiv").show();
	}
	else if (selectedItem === "repositories") {
		hideAll();
		console.log("repos");
	}
	else if (selectedItem === "resources") {
		hideAll();
		console.log("resources");
		$("#resourcesDiv").show();
	}
}

function hideAll() {
	$("#gradesDiv").hide();
	$("#assignmentsDiv").hide();
	$("#resourcesDiv").hide();
}
