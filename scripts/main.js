// global variables
var selectedClassCRN = "";
var selectedAssignmentID = "";
var role = "student";

// global variables for grades table, for when TA clicks on assignment
var selectedGradeTableAssignmentName = "";
var selectedGradeTableOldScore = "";
var selectedGradeTableRowIndex = -1;

// global variables for gradebook, lists of students in course
var studentsInCourse = [];

var repos = [];

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

		
	/*
	 // TODO doesn't actually return a username? only says if user is logged in or not
		$.post("GitGrader/php_scripts/get_username.php", {},
			function(data, status){
				ans = data["payload"];
				alert("USERNAME", data);
			});
*/

	$.post("GitGrader/php_scripts/get_courses.php", {},
			function(data, status){
			classes = [data['payload']];


	// TODO
	get_repos_obj();
	clickedOnFile('GitGrader/test.py');
	

	// fill class dropdown with class names
	fillInClasses();
	
	// fill in grades for each of these classes
	fillInGradesForClasses("mnelso12");

	fillInResourcesForClasses();

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
			if (thisClass.ROLE === "instructor") {
				$("#addAssignmentForm").show();
				$("#addResourceForm").show();
			} else {
				$("#addAssignmentForm").hide();
				$("#addResourceForm").hide();
			}

			// check if is TA for this class
			let classRole = getRoleFromCRN(selectedCourseCRN);
			if (classRole == "instructor") {
				role = "instructor";

				// fill in students in this course for TA's gradebook
				getStudentsInClass(selectedCourseCRN);
				$("#studentsListDiv").show();
			}
			else {
				role = "student";
				$("#studentsListDiv").hide();
			}
		});
	});


	// add event handlers to grades table 
	$(document).on("click", "#gradesTableBody tr", function(e) {
		if (role == "instructor") {
			// get info of the row that was clicked
			var children = this.children;
			selectedGradeTableAssignmentName = children[0].innerHTML;
			selectedGradeTableOldScore = children[1].innerHTML;
			selectedGradeTableOldComment = children[4].innerHTML;
			var row_index = $(this).index();
			selectedGradeTableRowIndex = row_index;
			console.log("selected!",row_index);


			// udpate info in change grade modal to match the selected row
			$("#gradeChangeAssignment").text(selectedGradeTableAssignmentName);
			$("#scoreInput").attr("placeholder", selectedGradeTableOldScore);
			$("#commentInput").attr("placeholder", selectedGradeTableOldComment);


			// open change grade modal
			$('#changeGrade').modal('open');
		}
	});



	// init
	initialize();

	// materialize
	$('.modal').modal();

	// no menu items selected initially, so hide right side content
	hideAll();
	$("#addResourceForm").hide();
	$("#addAssignmentForm").hide();
	$("#classesDiv").show();
	$("#classesNavButton").hide();

	// create nav bar class name options

	// handle class switches from nav bar
	/*
*/

	// selected assignment 
	$(document).on('click', "#assignmentsListDiv a", function() {
		selectedAssignmentID = this.id;
		assignmentSelected();
	});

	// save newly changed grade 
	$(document).on('click', "#changeGradeEnter", function() {
		console.log("save new grade");

		// get info from modal
		var newScore = $("#scoreInput").val();
		var newComment = $("#commentInput").val();
		var studentUsername = "mnelso12";
		var teacherUsername = "mconnol6";

		// send new score to database via PHP
		var ans = "";

		$.post("GitGrader/php_scripts/add_grade.php", {student_username: studentUsername, crn: selectedClassCRN, assignment_name: selectedGradeTableAssignmentName, grade: newScore, grade_comment: newComment},
			function(data, status){
				console.log(data, status);

				if (data["success"] == true) {
					console.log("grade update successful!");		
					alert("Grade update successful!");

					// update grades table to reflect new grade
					var num = parseInt(selectedGradeTableRowIndex) + 1;
					updateGradesTableWithNewStuff(num, newScore, newComment);
				}
				else {
					alert("Grade update failed with error:!", data["error"]["message"]);
					console.log("grade update failed, error:", data["error"]["message"]);
				}
			});

		// TODO update global classes object to reflect new grade?

	});

	function updateGradesTableWithNewStuff(rowIndex, score, comment) {
		var scoreStr = '#gradesTableBody tr:nth-child(' + rowIndex + ') td:nth-child(2)';
		var commentStr = '#gradesTableBody tr:nth-child(' + rowIndex + ') td:nth-child(5)';
		$(scoreStr).html(score);
		$(commentStr).html(comment);
	}

	// handle repos button in nav bar
	$("#reposNavButton").click(function() {
		openReposDiv();
	});

	$("#classesNavButton").click(function() {
		openClassesDiv();
	});

	// handle left menu switches
	$("#leftMenu .collection-item").click(function(){
		leftMenuSwitch(this.id);
	});

	// handle repo table click
	$("#repoTable").click(function (data) {
		$("#repoViewer").show();
		$("#allRepos").hide();
		fillInRepoViewer(data.target.id);
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

function fillInRepos(repos) {
	$("#repoTable tbody").html("");
	$("#unlinkedRepoTable tbody").html("");
	for (var i=0; i<repos.length; i++) {
		if (repos[i].ASSIGNMENT_NAME != undefined) {
			var html = '<tr><td class=repo id=' + repos[i].REPO_ID + '>' + repos[i].REPO_NAME + '</td><td>' + repos[i].COURSE_NAME + '</td><td>' + repos[i].ASSIGNMENT_NAME+ '</td></tr>';
			$("#repoTable tbody").append(html);
		} else {
			var html = '<tr><td class=repo id=' + repos[i].REPO_ID+ '>' + repos[i].REPO_NAME + '</td><td><a class="waves-effect waves-light btn" href="#modal2">';
			html = html + '<i class="material-icons right">call_merge</i>Link to Assignment</a></td></tr>';
			$("#unlinkedRepoTable tbody").append(html);
		}
	}
}

function fillInRepoViewer(id) {
	$.post("GitGrader/php_scripts/get_directory_files.php", {repo_id : id},
		function(data, status) {
			if (data.success == true) {
				$("#fileTree").html("");
				var files = data.payload.files;
				for (var file in files) {
					if (files[file].directory == false) {
						var onclick_text = "onclick='clickedOnFile(\"" + files[file].path + "\")'";
						var html = "<a class='collection-item black-text '" + onclick_text + ">" + file + "</a>";
						$("#fileTree").append(html);
						console.log(html);
					} else {
						var html = "<a class='collection-item black-text'>" + file + "</a>";
						$("#fileTree").append(html);
						console.log(html);
					}
				}
			}
		});
}

// get grades from crn 
/*
function getGradesForClass(thisCrn) {
	var ans = {};
	$.post("GitGrader/php_scripts/get_grades.php", {crn: thisCrn},
			function(data, status){
			ans = data["payload"];
	});
	return ans;
}
*/


function getStudentsInClass(crn) {
	var ans = [];
	$.post("GitGrader/php_scripts/get_students_in_course.php", {crn: crn},
			function(data, status){
			ans = data["payload"];
			updateStudentsList(ans);
	});
}

function updateStudentsList(list) {
	for (var i=0; i<list.length; i++) {
		let username = list[i]["USERNAME"];

		var html = "<a href='#!' class='cyan-text text-darken-2 assignment collection-item'>" + username + "</a>";
		$("#studentsList").append(html);
	}
}

function fillInGradesForClasses(student_username) {
	for (var i=0; i<classes[0].length; i++) {
		var thisClass = classes[0][i];
		var classCRN = thisClass.CRN;
		getGradesHelper(classCRN, i, student_username);
	}
}

function fillInResourcesForClasses() {
	for (var i=0; i<classes[0].length; i++) {
		var thisClass = classes[0][i];
		var classCRN = thisClass.CRN;
		getResourcesHelper(classCRN, i);
	}
}

// helper get grades function
function getGradesHelper(crn, i, student_username) {
	$.post("GitGrader/php_scripts/get_grades.php", {crn: crn},
			function(data, status){
			var gradesForClass = data["payload"];
			var thisClass = classes[0][i];
			var classCRN = thisClass.CRN;
			thisClass.ASSIGNMENTS = gradesForClass;
	});
}

// helper get grades function
function getResourcesHelper(crn, i) {
	$.post("GitGrader/php_scripts/get_resources.php", {crn: crn},
			function(data, status){
			var resourcesForClass = data["payload"];
			var thisClass = classes[0][i];
			var classCRN = thisClass.CRN;
			thisClass.RESOURCES = resourcesForClass;
	});
}

// fill in code viewer
function fillCodeViewer(ext, content) {
	console.log("content:", content, "ext:", ext);
	$("#codeView").html(content);
	$("#codeView").addClass(ext);
	
	// highlight the code
	$('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
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
	$("#resourcesListDiv").html("");
	$("#studentsList").html("");
	$("#linkAssignToRepo").hide();

	var thisClass = getClassFromCRN(CRN);

	//fill in this class's REOSURCES
	var RESOURCES = thisClass.RESOURCES;

	for (var i in RESOURCES) {
		var html = "<a href='" + RESOURCES[i].PATH+ "' download class='cyan-text text-darken-2 assignment collection-item'>" + RESOURCES[i].RESOURCE_NAME; 
		var html = html + "<i class='fa fa-download fa-2x right' aria-hidden='true'></i></a>";
		$("#resourcesListDiv").append(html);
	}

	// fill in this class's ASSIGNMENTS
	var ASSIGNMENTS = thisClass.ASSIGNMENTS;
	var sumOfWeights = 0;
	var sumOfWeightedScores = 0;

	for (var i in ASSIGNMENTS) {
		console.log("assignments", ASSIGNMENTS[i]);

		// fill in ASSIGNMENTS div
		var html = "<a href='#!' class='cyan-text text-darken-2 assignment collection-item' + id='" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "'>" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</a>"; 
		$("#assignmentsListDiv").append(html);

		// fill in grades div
		var tempScore = "";
		var tempWeight = "";
		var tempOutOf = "";
		var tempComment = "";
		var weightForClassGrade = 0;

		if (!ASSIGNMENTS[i].WEIGHT) {
			tempWeight = "--";
			weightForClassGrade = 0;
		} else {
			tempWeight = ASSIGNMENTS[i].WEIGHT;
			weightForClassGrade = parseInt(ASSIGNMENTS[i].WEIGHT);
		}

		if (!ASSIGNMENTS[i].GRADE) {
			tempScore = "--";
			weightForClassGrade = 0;
		} else {
			tempScore = ASSIGNMENTS[i].GRADE;
		}

		if (!ASSIGNMENTS[i].OUTOF) {
			tempOutOf = "--";
			weightForClassGrade = 0;
		} else {
			tempOutOf = ASSIGNMENTS[i].OUTOF;
		}

		if (!ASSIGNMENTS[i].GRADE_COMMENT) {
			tempComment = "";
			console.log("NO COMMENT");
		} else {
			tempComment = ASSIGNMENTS[i].GRADE_COMMENT;
			console.log("COMMENT", tempComment);
		}

		var gradesHTML = "<tr><td>" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</td><td>" + tempScore + "</td><td>" + tempOutOf + "</td><td>" + tempWeight + "</td><td>" + tempComment + "</td></tr>";
		$("#gradesTableBody").append(gradesHTML);

		// calculate class grade
		sumOfWeights = sumOfWeights + weightForClassGrade;
		var weightedScore = ((ASSIGNMENTS[i].GRADE)/(ASSIGNMENTS[i].OUTOF)) * weightForClassGrade;
		if (weightedScore) {
			sumOfWeightedScores = sumOfWeightedScores + weightedScore;
		}
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
	$("#assignmentLink").html("");
	$("#linkAssignToRepo").show();
	
	var thisClass = getClassFromCRN(selectedClassCRN);
	var ASSIGNMENTS = thisClass.ASSIGNMENTS;
	for (var i in ASSIGNMENTS) {
		if (ASSIGNMENTS[i].ASSIGNMENT_NAME == selectedAssignmentID){
			var dueDate = ASSIGNMENTS[i].DUE_DATE;
			var name = ASSIGNMENTS[i].ASSIGNMENT_NAME;
			var path = ASSIGNMENTS[i].PATH;
			if (dueDate != undefined) {
				$("#dueDate").append("Due Date: " + dueDate);
			}
			if (path != undefined) {
				$("#assignmentInstructions").html("View instructions");
				$("#assignmentInstructions").attr("href", path);
			}
			$("#assignmentName").append(name);
			return;
		}
	}
}

////////////////// methods for file viewer ///////////////////////


// get file tree and stuff for repo
function get_repos_obj(repo) {
	$.post("GitGrader/php_scripts/get_repos.php", {},
		function(data, status){
			if (data.success == true) {
				repos = data.payload;
				console.log("repos obj:", repos);
				fillInRepos(repos);
			}
		});
}

// did choose a repo
function didChooseRepo(repoName) {
	
	// update repo name
	$("#repoName").html(repoName);

	// update class / assignment name
	var classCRN = "";
	var assignmentName = "";
	var description = "";
	var repoID = "";
	var currentFileTree = [];

	console.log("repos", repos);

	repos[0].forEach(function(currentValue, index, arr){
		if (repoName == currentValue.REPO_NAME) {
			console.log("FOUND REPO!", currentValue);
			description = currentValue.DESCRIPTION;
			repoID = currentValue.REPO_ID;
			if (currentValue.CRN && currentValue.ASSIGNMENT_NAME)				{
				classCRN = currentValue.CRN;
				assignmentName = currentValue.ASSIGNMENT_NAME;
				$("#repoClassName").html(classCRN + " : " + assignmentName);
			} else {
					$("#repoClassName").html("(unlinked)");
			}
		}
	});
	$("#repoName").html(repoName);
	$("#repoDescription").html(description);

	// fill in collection view of files in this repo
	$.post("GitGrader/php_scripts/get_directory_tree.php", {repo_id: repoID},
			function(data, status){
			currentFileTree = [data['payload']];
		  fillFileList(currentFileTree);	
	});

	// TODO add click handlers to each file in collection view so the file content can be loaded into the code viewer

}

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

// fill in file list of current directory in repo
function fillFileList(fileTree) {
	fileTree.forEach(function(currentValue, index, arr){
	  for (var obj in currentValue) {	
			
			if (isNormalInteger(obj) == false) {
				continue;
			}

			var path = "/idk/";
			var fileName = currentValue[obj];
			var isDir = false;
			var fileHTML = "<a href='" + path + "' class='collection-item ";
	
			if (isDir == false) { // TODO colors don't work?
					fileHTML = fileHTML + "black-text";	
			} else {
					fileHTML = fileHTML + "indigo-text";	
			}	
	
			fileHTML = fileHTML + "'>" + fileName + "</a>";
	 
			$("#fileTree").append(fileHTML);
		}
	});
}


// fill in code viewer
function clickedOnFile(filePath) {
	//var filePath = "GitGrader/test.py";
	var fileName = getFileNameFromPath(filePath);
	$("#selectedClass").text(fileName);
	var contents = getContentsFromFilePath(filePath); 
	let ext = getExt(fileName);
	fillCodeViewer(ext, contents);
}

// get contents of file from path
function getContentsFromFilePath(path) {
	var content = "";
	var rawFile = new XMLHttpRequest();
    rawFile.open("GET", path, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
								content = allText;
            }
        }
    }
    rawFile.send(null);
		return content;
} 

// get file extension from string
function getExt(fileName) {
	var ext =  fileName.split('.').pop();
	return ext;
}

// get file name from path
function getFileNameFromPath(path) {
	var fileName = path.replace(/^.*[\\\/]/, '');
	return fileName;
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

function getRoleFromCRN(CRN) {
	var returnVal = "";

	classes[0].forEach(function(currentValue, index, arr){
		if (CRN == currentValue.CRN) {
			returnVal = currentValue.ROLE;
		}
	});

	return returnVal;
}


// Repos Button in Nav Bar //////////////////////////////////
function openReposDiv() {
	hideAll();
	//hideClasses();
	$("#allRepos").show();
	$("#repoViewer").hide();
	$("#reposDiv").show();
	$("#modalBtnDiv").show();
	selectedClassCRN = ""; // no class selected
	$("#selectedClass").text("");
	$("#classesButton").hide();
	$("#reposNavButton").hide();
	$("#classesNavButton").show();
}

function openClassesDiv() {
	hideAll();
	$("#classesDiv").show();
	$("#classesButton").show();
	$("#reposNavButton").show();
	$("#classesNavButton").hide();
}


// methods for menu switches ////////////////////////////////
function leftMenuSwitch(selectedItem) {
	if (selectedItem === "grades") {
		console.log("grades");
		hideAll();
		$("#gradesDiv").show();
		$("#classesDiv").show();
	}
	else if (selectedItem === "assignments") {
		console.log("assignments");
		hideAll();
		$("#assignmentsDiv").show();
		$("#classesDiv").show();
	}
	else if (selectedItem === "repositories") {
		hideAll();
		console.log("repos");
		$("#classRepos").show();
		$("#classesDiv").show();
	}
	else if (selectedItem === "resources") {
		hideAll();
		console.log("resources");
		$("#resourcesDiv").show();
		$("#classesDiv").show();
	}
}

function hideAll() {
	$("#allRepos").hide();
	$("#classRepos").hide();
	$("#gradesDiv").hide();
	$("#assignmentsDiv").hide();
	$("#resourcesDiv").hide();
	$("#reposDiv").hide();
	$("#modalBtnDiv").hide();
	$("#classesDiv").hide();
}

function hideClasses() {
	hideAll();
	$("#classesDiv").hide();
}
