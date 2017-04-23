// global variables
var selectedClassCRN = "";
var selectedAssignmentID = "";

$.post("GitGrader/php_scripts/get_courses.php", {},
	function(data, status){
		console.log(data);
});

var classes = [
	{
		department: "CSE",
		courseName: "Advanced Databases",
		crn: "12983",
		courseNumber: "40157-01",
		assignments: [
			{
				name: "HW1",
				weight: 10,
				outOf: 100,
				AID: "129038",
				dueDate: "1-12-17"
			},
			{
				name: "HW2",
				weight: 10,
				outOf: 100,
				AID: "112318",
				dueDate: "2-11-17"
			},
			{
				name: "HW3",
				weight: 10,
				outOf: 100,
				AID: "12123038",
				dueDate: "3-10-17"
			}
		]
	},
	{
		department: "CSE",
		courseName: "Fund Comp II",
		crn: "10239",
		courseNumber: "20101-02",
		assignments: [
			{
				name: "Lab 1",
				weight: 10,
				outOf: 100,
				AID: "129038",
				dueDate: "1-30-17"
			},
			{
				name: "Lab 2",
				weight: 10,
				outOf: 100,
				AID: "112318",
				dueDate: "2-03-17"
			},
			{
				name: "Lab 3",
				weight: 10,
				outOf: 100,
				AID: "12123038",
				dueDate: "2-10-17"
			}
		]

	},
	{
		department: "CSE",
		courseName: "Basic Unix",
		crn: "12387",
		courseNumber: "20189-01",
		assignments: [
			{
				name: "Project 1",
				weight: 10,
				outOf: 100,
				AID: "129038",
				dueDate: "1-28-17"
			},
			{
				name: "Project 2",
				weight: 10,
				outOf: 100,
				AID: "112318",
				dueDate: "2-3-17"
			},
			{
				name: "Project 3",
				weight: 10,
				outOf: 100,
				AID: "12123038",
				dueDate: "2-8-17"
			}
		]

	},
];

$( document ).ready(ready);

// doc ready
function ready() {
	console.log("doc ready from main.js");
	// init
	initialize();

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
		classSelected(selectedCourseCRN); // fill out rest of class info in divs
		selectedClassCRN = selectedCourseCRN;
	});

	// selected assignment 
	$(document).on('click', "#assignmentsListDiv a", function() {
		selectedAssignmentID = this.id;
		assignmentSelected();
	});

	// handle repos button in nav bar
	$("#reposNavButton").click(function() {
		openReposDiv();
	});

	// handle left menu switches
	$("#leftMenu .collection-item").click(function(){
		leftMenuSwitch(this.id);
	});
}

// initialize
function initialize() {
	console.log("initializing from main.js");
	// fill class dropdown with class names
	fillInClasses();

	// only appear when assignment is selected
	$("#linkAssignToRepo").hide();
}

// fill dropdown with class names
function fillInClasses() {
	for (var i in classes) {
		var className = classes[i].courseName;
		var html = "<li><a href='#!'>" + className + "</a></li>"; 
		$("#classDropdown").append(html);
	}
}

// fill in class info for given class
function classSelected(crn) {
	// clear old class data
	$("#assignmentsListDiv").html("");
	$("#assignmentName").html("");
	$("#dueDate").html("");
	$("#linkAssignToRepo").hide();

	var thisClass = getClassFromCRN(crn);
	var assignments = thisClass.assignments;
	for (var i in assignments) {
		// fill in assignments div
		var html = "<a href='#!' class='cyan-text text-darken-2 assignment collection-item' + id=" + assignments[i].AID + ">" + assignments[i].name + "</a>"; 
		$("#assignmentsListDiv").append(html);
	}
}

// change right div specific to each different assignment
function assignmentSelected() {
	// clear old assignemnt name and due date
	$("#assignmentName").html("");
	$("#dueDate").html("");
	$("#linkAssignToRepo").show();
	
	var thisClass = getClassFromCRN(selectedClassCRN);
	var assignments = thisClass.assignments;
	for (var i in assignments) {
		if (assignments[i].AID == selectedAssignmentID){
			var dueDate = assignments[i].dueDate;
			var name = assignments[i].name;
			$("#dueDate").append("Due Date: " + dueDate);
			$("#assignmentName").append(name);
			return;
		}
	}
}

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

function getClassFromCRN(crn) {
	var returnVal = "";

	classes.forEach(function(currentValue, index, arr){
		if (crn == currentValue.crn) {
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


// Repos Button in Nav Bar //////////////////////////////////
function openReposDiv() {
	console.log("pressed repos button");
	hideAll();
	$("#allRepos").show();
	selectedClassCRN = ""; // no class selected
	$("#selectedClass").text("no class selected - all repos");
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
		$("#classRepos").show();
	}
	else if (selectedItem === "resources") {
		hideAll();
		console.log("resources");
		$("#resourcesDiv").show();
	}
}

function hideAll() {
	$("#allRepos").hide();
	$("#classRepos").hide();
	$("#gradesDiv").hide();
	$("#assignmentsDiv").hide();
	$("#resourcesDiv").hide();
}
