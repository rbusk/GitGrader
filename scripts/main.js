// global variables
var selectedClassCRN = "";
var selectedAssignmentID = "";

var classes = [
	{
		DEPT: "CSE",
		COURSE_NAME: "Advanced Databases",
		CRN: "12983",
		COURSE_NO: "40157-01",
		ASSIGNMENTS: [
			{
				name: "HW1",
				weight: 10, 
				userScore: 76,
				outOf: 100,
				AID: "129038",
				dueDate: "1-12-17"
			},
			{
				name: "HW2",
				weight: 10, 
				userScore: 85,
				outOf: 100,
				AID: "112318",
				dueDate: "2-11-17"
			},
			{
				name: "HW3",
				weight: 10, 
				userScore: 97,
				outOf: 100,
				AID: "12123038",
				dueDate: "3-10-17"
			}
		]
	},
	{
		DEPT: "CSE",
		COURSE_NAME: "Fund Comp II",
		CRN: "10239",
		COURSE_NO: "20101-02",
		ASSIGNMENTS: [
			{
				name: "Lab 1",
				weight: 10, 
				userScore: 82,
				outOf: 100,
				AID: "129038",
				dueDate: "1-30-17"
			},
			{
				name: "Lab 2",
				weight: 10, 
				userScore: 82,
				outOf: 100,
				AID: "112318",
				dueDate: "2-03-17"
			},
			{
				name: "Lab 3",
				weight: 10, 
				userScore: 83,
				outOf: 100,
				AID: "12123038",
				dueDate: "2-10-17"
			}
		]

	},
	{
		DEPT: "CSE",
		COURSE_NAME: "Basic Unix",
		CRN: "12387",
		COURSE_NO: "20189-01",
		ASSIGNMENTS: [
			{
				name: "Project 1",
				weight: 10, 
				userScore: 95,
				outOf: 100,
				AID: "129038",
				dueDate: "1-28-17"
			},
			{
				name: "Project 2",
				weight: 10, 
				userScore: 67,
				outOf: 100,
				AID: "112318",
				dueDate: "2-3-17"
			},
			{
				name: "Project 3",
				weight: 10, 
				userScore: 78,
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

	$.post("GitGrader/php_scripts/get_courses.php", {},
			function(data, status){
			console.log(data);
			classes = [data['payload']];

	// fill class dropdown with class names
	fillInClasses();
	
	// fill in grades for each of these classes
	fillInGradesForClasses();

	// add event handlers to classes dropdown in nav bar
	$("#classDropdown li a").click(function(){
			var selectedCourseName = this.text;
			var thisClass = getClassFromName(selectedCourseName);
			var selectedCourseCRN = thisClass.CRN;
			var selectedCourseDepartment = thisClass.DEPT;
			var selectedCourseNumber = thisClass.COURSE_NO;
			$("#selectedClass").text(selectedCourseDepartment + " " + selectedCourseNumber + " : " + selectedCourseName);
			classSelected(selectedCourseCRN); // fill out rest of class info in divs
			selectedClassCRN = selectedCourseCRN;
			});
	});



	// init
	initialize();

	// materialize
	$('.modal').modal();

	// no menu items selected initially, so hide right side content
	hideAll();

	// create nav bar class name options

	// handle class switches from nav bar
	/*
*/

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

	// only appear when assignment is selected
	$("#linkAssignToRepo").hide();
}

// fill dropdown with class names
function fillInClasses() {
	for (var i=0; i<classes[0].length; i++) {
		var className = classes[0][i].COURSE_NAME;
		var html = "<li><a href='#!'>" + className + "</a></li>"; 
		$("#classDropdown").append(html);
	}
}

// get grades from crn 
function getGradesForClass(thisCrn) {
	var ans = {};
	$.post("GitGrader/php_scripts/get_grades.php", {crn: thisCrn},
			function(data, status){
			console.log("returned these grades data for crn", data);
			ans = data["payload"];
	});
	return ans;
}

function fillInGradesForClasses() {
	for (var i=0; i<classes[0].length; i++) {
		var thisClass = classes[0][i];
		var classCRN = thisClass.CRN;
		getGradesHelper(classCRN, i);
	}
}

// helper get grades function
function getGradesHelper(crn, i) {
	$.post("GitGrader/php_scripts/get_grades.php", {crn: crn},
			function(data, status){
			var gradesForClass = data["payload"];
			var thisClass = classes[0][i];
			var classCRN = thisClass.CRN;
			thisClass.ASSIGNMENTS = gradesForClass;
	});
}


// fill in class info for given class
function classSelected(CRN) {

	console.log("SELECTED THIS CRN", CRN);

	// clear old class data
	$("#assignmentsListDiv").html("");
	$("#gradesTableBody").html("");
	$("#assignmentName").html("");
	$("#dueDate").html("");
	$("#linkAssignToRepo").hide();

	var thisClass = getClassFromCRN(CRN);

	// fill in this class's ASSIGNMENTS
	var ASSIGNMENTS = thisClass.ASSIGNMENTS;
	var sumOfWeights = 0;
	var sumOfWeightedScores = 0;

	for (var i in ASSIGNMENTS) {

		// fill in ASSIGNMENTS div
		var html = "<a href='#!' class='cyan-text text-darken-2 assignment collection-item' + id=" + ASSIGNMENTS[i].AID + ">" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</a>"; 
		$("#assignmentsListDiv").append(html);

		// fill in grades div
		var tempScore = "";
		var tempWeight = "";
		var tempOutOf = "";
		var weightForClassGrade = 0;

		if (!ASSIGNMENTS[i].WEIGHT) {
			console.log("no weight for this assignment yet");	
			tempWeight = "--";
			weightForClassGrade = 0;
		} else {
			tempWeight = ASSIGNMENTS[i].WEIGHT;
			weightForClassGrade = parseInt(ASSIGNMENTS[i].WEIGHT);
		}

		if (!ASSIGNMENTS[i].GRADE) {
			console.log("no grade for this assignment yet");	
			tempScore = "--";
			weightForClassGrade = 0;
		} else {
			tempScore = ASSIGNMENTS[i].GRADE;
		}

		if (!ASSIGNMENTS[i].OUTOF) {
			console.log("no outof for this assignment yet");	
			tempOutOf = "--";
			weightForClassGrade = 0;
		} else {
			tempOutOf = ASSIGNMENTS[i].OUTOF;
		}

		var gradesHTML = "<tr><td>" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</td><td>" + tempScore + "</td><td>" + tempOutOf + "</td><td>" + tempWeight + "</td></tr>";
		$("#gradesTableBody").append(gradesHTML);

		// calculate class grade
		sumOfWeights = sumOfWeights + weightForClassGrade;
		console.log("sum of weights:", sumOfWeights);
		var weightedScore = ((ASSIGNMENTS[i].GRADE)/(ASSIGNMENTS[i].OUTOF)) * weightForClassGrade;
		console.log("weighted score:", weightedScore);
		if (weightedScore) {
			sumOfWeightedScores = sumOfWeightedScores + weightedScore;
		}
		console.log("sum of weighted scores:", sumOfWeightedScores);
	}

	// update class grade on page
	if (sumOfWeightedScores != 0) {
		var classGrade = (sumOfWeightedScores/sumOfWeights) * 100; 
		var gradeCutOffs = {'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D': 60, 'F': 0};
		var letterGrade = "BLAH";
		for (var letter in gradeCutOffs) {
			if (classGrade >= gradeCutOffs[letter]) {
				letterGrade = letter;
				break;
			}
		}
		$("#classGrade").text("Class Grade: " + classGrade.toFixed(1) + "% (" + letterGrade + ")");	
	}
	else {
		$("#classGrade").text("Class Grade: N/A");	
	}

}

// change right div specific to each different assignment
function assignmentSelected() {
	// clear old assignemnt name and due date
	$("#assignmentName").html("");
	$("#dueDate").html("");
	$("#linkAssignToRepo").show();
	
	var thisClass = getClassFromCRN(selectedClassCRN);
	var ASSIGNMENTS = thisClass.ASSIGNMENTS;
	for (var i in ASSIGNMENTS) {
		if (ASSIGNMENTS[i].AID == selectedAssignmentID){
			var dueDate = ASSIGNMENTS[i].dueDate;
			var name = ASSIGNMENTS[i].name;
			$("#dueDate").append("Due Date: " + dueDate);
			$("#assignmentName").append(name);
			return;
		}
	}
}

// methods for class object ////////////////////////////////
function getClassFromName(className) {
	var returnVal = "";

	classes[0].forEach(function(currentValue, index, arr){
		if (className == currentValue.COURSE_NAME) {
			returnVal = currentValue;
		}
	});

	return returnVal;
}

function getClassFromCRN(CRN) {
	var returnVal = "";

	classes[0].forEach(function(currentValue, index, arr){
		if (CRN == currentValue.CRN) {
			returnVal = currentValue;
		}
	});

	return returnVal;
}

function getNameFromCRN(CRN) {
	var returnVal = "";

	classes[0].forEach(function(currentValue, index, arr){
		if (CRN == currentValue.CRN) {
			returnVal = currentValue.COURSE_NAME;
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
