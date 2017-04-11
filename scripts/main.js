// global variables
var selectedClassCRN = "";
var classes = [
	{
		department: "CSE",
		courseName: "Advanced Databases",
		crn: "12983",
		courseNumber: "40157-01"
	},
	{
		department: "CSE",
		courseName: "Fundamentals of Computing II",
		crn: "10239",
		courseNumber: "20101-02"
	},
	{
		department: "CSE",
		courseName: "Basic Unix",
		crn: "12387",
		courseNumber: "20189-01"
	},
];

$( document ).ready(function() {
	// materialize
	$('.modal').modal();

	// no menu items selected initially, so hide right side content
	hideAll();

	// handle class switches from nav bar
	$("#classDropdown li a").click(function(){
		var selectedCourseName = this.text;
		var thisClass = getClassFromName(selectedCourseName);
		var selectedCourseCRN = thisClass.crn;
		var selectedCourseDepartment = thisClass.department;
		var selectedCourseNumber = thisClass.courseNumber;
		$("#selectedClass").text(selectedCourseDepartment + " " + selectedCourseNumber + " : " + selectedCourseName);
	});

	// handle left menu switches
	$("#leftMenu .collection-item").click(function(){
		leftMenuSwitch(this.id);
	});

});

// methods for class object ////////////////////////////////
function getClassFromName(className) {
	var returnVal = "";

	classes.forEach(function(currentValue, index, arr){
		if (className == currentValue.courseName) {
			returnVal = currentValue;
		}
	});

	return returnVal;
}

function getNameFromCRN(crn) {
	var returnVal = "";

	classes.forEach(function(currentValue, index, arr){
		if (crn == currentValue.crn) {
			returnVal = currentValue.courseName;
		}
	});

	return returnVal;
}

// methods for menu switches ////////////////////////////////
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
