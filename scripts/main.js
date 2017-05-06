// global variables
var selectedClassCRN = "";
var selectedClassName = "";
var selectedAssignmentID = "";
var studentUsername = ""; // selected student, for when TA is grading
var role = "student";

// global variables for grades table, for when TA clicks on assignment
var selectedGradeTableAssignmentName = "";
var selectedGradeTableOldScore = "";
var selectedGradeTableRowIndex = -1;

// global variables for gradebook, lists of students in course
var studentsInCourse = [];
var sumOfWeightedScores = 0;
var sumOfWeights = 0;

var repos = [];

//stack for repo paths
var repo_paths = [];
var repo_id = "";
var fileName = "";
var comments = []; // comments on repo

var classes = [];


$( document ).ready(ready);

// doc ready
function ready() {
	console.log("doc ready from main.js");
		

	$.post("GitGrader/php_scripts/get_courses.php", {},
			function(data, status){
			classes = [data['payload']];
			console.log("got this class data at start:", classes);


	get_repos_obj();

	// fill class dropdown with class names
	fillInClasses();
	
	// fill in grades for each of these classes
	fillInGradesForClasses();

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
				$("#teacherModalDiv").show();
			} else {
				$("#addAssignmentForm").hide();
				$("#addResourceForm").hide();
				$("#teacherModalDiv").hide();
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
	$(document).on("click", "#gradesTableBody tr .score_cell", function(e) {

		if (role == "instructor") {
			// get info of the row that was clicked
			var table_row = this.closest('tr');
			var children = table_row.children;
			selectedGradeTableAssignmentName = children[0].innerHTML;
			selectedGradeTableOldScore = children[1].innerHTML;
			selectedGradeTableOldComment = children[4].innerHTML;
			var row_index = $(table_row).index();
			selectedGradeTableRowIndex = row_index;


			// udpate info in change grade modal to match the selected row
			$("#gradeChangeAssignment").text(selectedGradeTableAssignmentName);
			$("#scoreInput").attr("placeholder", selectedGradeTableOldScore);
			$("#commentInput").attr("placeholder", selectedGradeTableOldComment);


			// open change grade modal
			$('#changeGrade').modal('open');
		}
	});

	// add event handlers to grades table 
	$(document).on("click", "#gradesTableBody tr .assignment_name_cell", function(e) {
		if (role == "instructor") {
			if (e.target.id != undefined && e.target.id != "") {
				$("#reposDiv").show();
				$("#repoViewer").show();
				$("#classesDiv").hide();
				$("#repoModalDiv2").show();
				$("#classModalDiv").hide();
				$("#teacherModalDiv").hide();
				get_repos_obj(e.target.id);
				fillInRepoViewer(e.target.id);
			}
		}
	});

	$(document).on("click", "#backToGradebookButton", function() {
		$("#reposDiv").hide();
		$("#repoViewer").hide();
		$("#classesDiv").show();
		$("#repoModalDiv2").hide();
		$("#classModalDiv").show();
		$("#teacherModalDiv").show();
	});


	// init
	initialize();

	// materialize
	$('.modal').modal();

	modalButtonHandlers();

	// no menu items selected initially, so hide right side content
	hideAll();
	$("#addResourceForm").hide();
	$("#addAssignmentForm").hide();
	$("#classesDiv").show();
	$("#classesNavButton").hide();
	$("#classModalDiv").show();

	// create nav bar class name options

	// handle class switches from nav bar
	/*
*/

	// selected assignment 
	$(document).on('click', "#assignmentsListDiv a", function() {

		selectedAssignmentID = this.id;
		assignmentSelected();

		// handle selection color
		$("#assignmentsListDiv a").removeClass('cyan lighten-5');
		$(this).addClass('cyan lighten-5');
	});

	// save newly changed grade 
	$(document).on('click', "#changeGradeEnter", function() {

		// get info from modal
		var newScore = $("#scoreInput").val();
		var newComment = $("#commentInput").val();
		var teacherUsername = "mconnol6"; // TODO un-hard-code this

		// check for negative grades
		if (newScore < 0) {
			$("#errorMessage").html("Cannot enter a negative score.");
			$('#errorModal').modal('open');
			return;
		}

		// send new score to database via PHP
		var ans = "";

		$.post("GitGrader/php_scripts/add_grade.php", {student_username: studentUsername, crn: selectedClassCRN, assignment_name: selectedGradeTableAssignmentName, grade: newScore, grade_comment: newComment},
			function(data, status){
				console.log(data, status);

				if (data["success"] == true) {
					// update grades table to reflect new grade
					var num = parseInt(selectedGradeTableRowIndex) + 1;
					updateGradesTableWithNewStuff(num, newScore, newComment);
					updateClassGrade(newScore, outof, weight);
				}
				else {
					alert("Grade update failed with error:!", data["error"]["message"]);
					console.log("grade update failed, error:", data["error"]["message"]);
				}
			});

		// TODO update global classes object to reflect new grade?

	});

	// add instructor
	$("#addInstructorBtn").click( function() {
		console.log("hi");

		// get info from modal
		var instructorInput = $("#instructorInput").val();

		$.post("GitGrader/php_scripts/add_teaches_course.php", {username: instructorInput, crn: selectedClassCRN},
			function(data, status){
				console.log(data, status);

			});

		// TODO update global classes object to reflect new comment?

	});

	function updateGradesTableWithNewStuff(rowIndex, score, comment) {
		var scoreStr = '#gradesTableBody tr:nth-child(' + rowIndex + ') td:nth-child(2)';
		var commentStr = '#gradesTableBody tr:nth-child(' + rowIndex + ') td:nth-child(5)';
		$(scoreStr).html(score);
		$(commentStr).html(comment);
	}

	// handle repos button in nav bar
	$("#reposNavButton").click(function() {
		get_repos_obj();
		openReposDiv();
	});

	$("#classesNavButton").click(function() {
		openClassesDiv();
	});

	$("#backToReposButton").click(function() {
		openReposDiv();
	});

	// handle left menu switches
	$("#leftMenu .collection-item").click(function(){
		leftMenuSwitch(this.id);
	});

	// handle repo table click
	$("#repoTable").click(function (data) {
		$("#repoViewer").show();
		$("#allRepos").hide();
		$("#repoModalDiv").show();
		$("#modalBtnDiv").hide();
		fillInRepoViewer(data.target.id);
	});
	
	// handle repo table click
	$("#unlinkedRepoTable").click(function (data) {
		$("#repoViewer").show();
		$("#allRepos").hide();
		$("#repoModalDiv").show();
		$("#modalBtnDiv").hide();
		fillInRepoViewer(data.target.id);
	});

	$("#modal2 tbody").click(function(data) {
		var id = $(data.target).closest('tr').attr('id');
		$.post("GitGrader/php_scripts/link_repo.php", {repo_id : id, crn: selectedClassCRN, assignment_name: selectedAssignmentID},
			function(data, status) {
				$("#modal2").modal('close');
				get_repos_obj();
			});
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
	$("#modal2 tbody").html("");
	for (var i=0; i<repos.length; i++) {
		if (repos[i].ASSIGNMENT_NAME != undefined) {
			var html = '<tr><td class=repo id=' + repos[i].REPO_ID + '>' + repos[i].REPO_NAME + '</td><td>' + repos[i].COURSE_NAME + '</td><td>' + repos[i].ASSIGNMENT_NAME+ '</td></tr>';
			$("#repoTable tbody").append(html);
		} else {
			var html = '<tr><td class=repo id=' + repos[i].REPO_ID+ '>' + repos[i].REPO_NAME + '</td></tr>';
			$("#unlinkedRepoTable tbody").append(html);
			var html2 = "<tr id=" + repos[i].REPO_ID + "><td>" + repos[i].REPO_NAME +  "</td><td class='waves-effect waves-light btn' href='#modal2'><i class='material-icons right'>call_merge</i>Link</a></td></tr>";
			$("#modal2 tbody").append(html2);
		}
	}
}

function updateClassGrade(newScore, newOutOf, newWeight) {

}

function goUpDirectoryRepoViewer() {
	if (repo_paths.length > 1) {
		repo_paths.pop();
		fillInRepoViewerWithPath(repo_paths[repo_paths.length - 1], true);
	}
}

function fillInRepoViewerWithPath(path, back) {
	console.log(path);
	$.post("GitGrader/php_scripts/get_directory_files.php", {repo_path : path},
		function(data, status) {
			if (data.success == true) {
				$("#codeComments").html("");
				if (!back) {
					repo_paths.push(path);
				}
				console.log("", repo_paths);
				$("#fileTree").html("");
				$("#codeView").html("");
				var files = data.payload.files;
				for (var $i=0; $i<files.length; $i++) {
					if (files[$i].directory == false) {
						var onclick_text = "onclick='clickedOnFile(\"" + files[$i].path + "\")'";
						var html = "<a class='collection-item black-text '" + onclick_text + ">" + files[$i].filename + "</a>";
						$("#fileTree").append(html);
					} else {
						var onclick_text = "onclick='fillInRepoViewerWithPath(\"" + files[$i].path + "\", false)'";
						var html = "<a class='collection-item teal-text '" + onclick_text + ">" + files[$i].filename + "</a>";
						$("#fileTree").append(html);
					}
				}
				if (repo_paths.length > 1) {
					var onclick_text = "onclick='goUpDirectoryRepoViewer()'";
					var html = "<a class='collection-item teal-text '" + onclick_text + ">..</a>";
					$("#fileTree").prepend(html);
				}
			}
		});
}

function fillInRepoViewer(id) {

	repo_id = id;
	console.log(repo_id);
	$.post("GitGrader/php_scripts/auto_pull_repo.php",{repo_id : id},
		function(data, status) {});
	$.post("GitGrader/php_scripts/get_directory_files.php", {repo_id : id},
		function(data, status) {
			if (data.success == true) {
				$('#ssh_link').text("ec2-user@34.208.159.24:/home/ec2-user/"+data.payload.repo_path + ".git");
				$("#codeComments").html("");
				didChooseRepo(id);
				repo_paths = [];
				repo_paths.push(data.payload.repo_path);
				$("#fileTree").html("");
				$("#codeView").html("");
				var files = data.payload.files;
				for (var $i=0; $i<files.length; $i++) {
					if (files[$i].directory == false) {
						var onclick_text = "onclick='clickedOnFile(\"" + files[$i].path + "\")'";
						var html = "<a class='collection-item black-text '" + onclick_text + ">" + files[$i].filename + "</a>";
						$("#fileTree").append(html);
						console.log(html);
					} else {
						var onclick_text = "onclick='fillInRepoViewerWithPath(\"" + files[$i].path + "\", false)'";
						var html = "<a class='collection-item teal-text '" + onclick_text + ">" + files[$i].filename + "</a>";
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

	$(document).on("click", "#studentsList a", function(e) {
		$("#gradesTableBody").html(""); // clear old grades
		studentUsername = this.innerHTML;
		getAllGradesForCRN(selectedClassCRN, studentUsername)

		// handle selection color
		$("#studentsList a").removeClass('cyan lighten-5');
		$(this).addClass('cyan lighten-5');
	});
}

function getAllGradesForCRN(crn, student_username) {
	$.post("GitGrader/php_scripts/get_all_class_grades.php", {crn: crn},
			function(data, status){
			$("#gradesTableBody").html(""); // clear old grades - KEEP THIS HERE!
			ans = data["payload"];
			console.log(ans);
			console.log(ans[student_username]);
			fillInGradesForSelectedStudent(ans[student_username]);
	});
}

function fillInGradesForSelectedStudent(grades){
	console.log("attempting to fill in grades for student", grades);

	// fill in this class's ASSIGNMENTS
	var ASSIGNMENTS = grades;
	sumOfWeights = 0;
	sumOfWeightedScores = 0;

	for (var i in ASSIGNMENTS) {
		console.log("grades", ASSIGNMENTS[i]);

		// fill in ASSIGNMENTS div
		//var html = "<a href='#!' class='cyan-text text-darken-2 assignment collection-item' + id='" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "'>" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</a>"; 
		//$("#assignmentsListDiv").append(html);

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
		} else {
			tempComment = ASSIGNMENTS[i].GRADE_COMMENT;
		}

	
		if (ASSIGNMENTS[i].REPO_ID != undefined) {
			var gradesHTML = "<tr><td id =" + ASSIGNMENTS[i].REPO_ID + " class='assignment_name_cell'>" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</td><td class='score_cell'>" + tempScore + "</td><td>" + tempOutOf + "</td><td>" + tempWeight + "</td><td>" + tempComment + "</td></tr>";
			$("#gradesTableBody").append(gradesHTML);
		} else {
			var gradesHTML = "<tr><td class='assignment_name_cell'>" + ASSIGNMENTS[i].ASSIGNMENT_NAME + "</td><td class='score_cell'>" + tempScore + "</td><td>" + tempOutOf + "</td><td>" + tempWeight + "</td><td>" + tempComment + "</td></tr>";
			$("#gradesTableBody").append(gradesHTML);
		}
		
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

function fillInGradesForClasses() {

	var student_username = "";

	$.post("GitGrader/php_scripts/get_username.php", {},
		function(data, status){
			//console.log('username?', data['payload']['username']);
			student_username = data['payload']['username'];
	});

	for (var i=0; i<classes[0].length; i++) {
		var thisClass = classes[0][i];
		var classCRN = thisClass.CRN;
		if (thisClass.ROLE === "student") {
			getGradesHelper(classCRN, i, student_username);
		} else {
			getAssignmentsHelper(classCRN, i);
		}
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

function getAssignmentsHelper(crn, i) {
	$.post("GitGrader/php_scripts/get_assignments.php", {crn: crn},
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
	//console.log("content:", content, "ext:", ext);
	$("#codeView").html(content);
	$("#codeView").addClass(ext);
	
	// highlight the code
	$('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}


// fill in class info for given class
function classSelected(CRN) {

	$("#addAssignmentCRN").val(CRN);

	console.log("SELECTED THIS CRN", CRN);

	// clear old class data
	$("#assignmentsListDiv").html("");
	$("#gradesTableBody").html("");
	$("#assignmentName").html("");
	$("#dueDate").html("");
	$("#assignmentInstructions").html("");
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

		// only add grades to DOM if is own student's grades, if TA then don't show grades until selected a student
		var thisClass = getClassFromCRN(selectedClassCRN);
		if (thisClass.ROLE == "student") {
			$("#gradesTableBody").append(gradesHTML);
		}

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
	$("#assignmentInstructions").html("");
	$("#assignmentLink").html("");

	var thisClass = getClassFromCRN(selectedClassCRN);
	if (thisClass.ROLE == "student") {
		$("#linkAssignToRepo").show();
	} else {
		$("#linkAssignToRepo").hide();
	}
	
	var ASSIGNMENTS = thisClass.ASSIGNMENTS;
	console.log("assignments of selected class crn", ASSIGNMENTS);
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
				$("#assignmentInstructions").show();
			} else {
				$("#assignmentInstructions").hide();
			}
			$("#assignmentName").append(name);
			return;
		}
	}
}

////////////////// methods for file viewer ///////////////////////


// get file tree and stuff for repo
function get_repos_obj(repo) {
	if (repo != undefined) {
		$.post("GitGrader/php_scripts/get_repos.php", {repo_id : repo},
			function(data, status){
				if (data.success == true) {
					repos = data.payload;
					console.log("repos obj:", repos);
					fillInRepos(repos);
				}
			});
	} else {
		$.post("GitGrader/php_scripts/get_repos.php", {},
			function(data, status){
				if (data.success == true) {
					repos = data.payload;
					console.log("repos obj:", repos);
					fillInRepos(repos);
				}
			});
	}
}

// did choose a repo
function didChooseRepo(repo_id) {

	// update class / assignment name
	var classCRN = "";
	var assignmentName = "";
	var description = "";
	repoID = "";
	var currentFileTree = [];

	console.log("repos", repos);

	repos.forEach(function(currentValue, index, arr){
		if (repo_id == currentValue.REPO_ID) {
			console.log("FOUND REPO!", currentValue);
			$("#repoName").html(currentValue.REPO_NAME);
			description = currentValue.DESCRIPTION;
			repoID = currentValue.REPO_ID;
			/*if (currentValue.ASSIGNMENT_NAME)				{
				classCRN = currentValue.CRN;
				assignmentName = currentValue.ASSIGNMENT_NAME;
				$("#repoClassName").html(classCRN + " : " + assignmentName);
			} else {
					$("#repoClassName").html("(unlinked)");
			}*/
		}
	});
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
	// display file contents
	fileName = getFileNameFromPath(filePath);
	var contents = getContentsFromFilePath(filePath); 
	let ext = getExt(fileName);
	fillCodeViewer(ext, contents);


	// fill in comments for the selected file here
	$("#codeComments").html("");

	$.post("GitGrader/php_scripts/get_comments_for_file.php", {repo_id: repo_id, file_path: repo_paths[repo_paths.length-1] + '/' + fileName},
			function(data, status){
				comments = data['payload'];
				for (var i=0; i<comments.length; i++) {
					console.log('comment:', comments[i]);	
				
					var commentContent = comments[i]['CONTENT'];
					var html = "<a href='#!' class='collection-item'><span class='black-text'>" + comments[i].COMMENTER_ID + "</span><br/>" + commentContent + "</a>"; 
					$("#codeComments").append(html);
				}
			});
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
	hideClasses();
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
	$("#classModalDiv").show();
}


// methods for menu switches ////////////////////////////////
function leftMenuSwitch(selectedItem) {
	var thisClass = getClassFromCRN(selectedClassCRN);
	hideAll();
	$("#classModalDiv").show();
	if(thisClass.ROLE === "instructor") {
		$("#teacherModalDiv").show();
	}
	if (selectedItem === "grades") {
		$("#gradesDiv").show();
		$("#classesDiv").show();
	}
	else if (selectedItem === "assignments") {
		$("#assignmentsDiv").show();
		$("#classesDiv").show();
	}
	else if (selectedItem === "repositories") {
		$("#classRepos").show();
		$("#classesDiv").show();
	}
	else if (selectedItem === "resources") {
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
	$("#repoModalDiv").hide();
	$("#classModalDiv").hide();
	$("#teacherModalDiv").hide();
	$("#repoModalDiv2").hide();
}

function hideClasses() {
	hideAll();
	$("#classesDiv").hide();
}

function modalButtonHandlers() {
	
	// add comment
	$(document).on('click', "#addCommentModalBtn", function() {

		// get info from modal
		var newComment = $("#comment_input").val();

		// send new score to database via PHP
		var ans = "";
		console.log(repo_id);	
		$.post("GitGrader/php_scripts/add_comment.php", {content: newComment, file_path: repo_paths[repo_paths.length-1]+'/'+fileName, repo_id: repo_id},
			function(data, status){
				console.log(data, status);
				clickedOnFile(repo_paths[repo_paths.length-1]+'/'+fileName);

			});

		// TODO update global classes object to reflect new comment?

	});

	$(document).on('click', "#addStudentModalBtn", function() {

		// get info from modal
		var student = $("#studentInput").val();

		// send new score to database via PHP
		var ans = "";
		
		$.post("GitGrader/php_scripts/add_takes_course.php", {username: student, crn: selectedClassCRN},
			function(data, status){
				console.log(data, status);

			});

		// TODO update global classes object to reflect new comment?

	});
	
	$(document).on('click', "#addAssignmentModalBtn", function() {
		// add new assignment to database
		let name = $("#assignmentFormName").val();
		let outOf = $("#assignmentFormOutOf").val();
		let weight = $("#assignmentFormWeight").val();
		let crn = $("#addAssignmentCRN").val();

		// check if form inputs are valid
		if (!name) {
			$("#errorMessage").html("You must enter an assignment name.");
			$('#errorModal').modal('open');
			return;
		}
		if (!weight) {
			$("#errorMessage").html("You must enter an assignment weight.");
			$('#errorModal').modal('open');
			return;
		}
		if (!crn) {
			$("#errorMessage").html("Could not find CRN for new assignment.");
			$('#errorModal').modal('open');
			return;
		}
		if (!outOf) {
			$("#errorMessage").html("You must enter an assignment 'out of'.");
			$('#errorModal').modal('open');
			return;
		}


		$.post("GitGrader/php_scripts/add_assignment.php", {crn: crn, assignment_name: name, weight: weight, outof: outOf, due_date: ""},
			function(data, status){
				console.log("status:", status);
				if (status == "success") {
					successfulAddAssignment();
				}
				else {
					$("#errorMessage").html("New assignment add unsuccessful");
					$('#errorModal').modal('open');
				}
			});

	});

	$(document).on('click', "#addClassModalBtn", function() {

		// get info from modal
		var name = $("#crsname").val();
		var number = $("#course_nm").val();
		var dept = $("#departmentinput").val();
		var course_crn = $("#crninput").val();
		
		if (!name) {
			$("#errorMessage").html("You must enter a name for the course.");
			$('#errorModal').modal('open');
			return;
		}
		if (!number) {
			$("#errorMessage").html("You must enter a course number.");
			$('#errorModal').modal('open');
			return;
		}
		if (!dept) {
			$("#errorMessage").html("You must enter a department.");
			$('#errorModal').modal('open');
			return;
		}
		if (!course_crn) {
			$("#errorMessage").html("You must enter a CRN.");
			$('#errorModal').modal('open');
			return;
		}
		
		$.post("GitGrader/php_scripts/add_course.php", {crn: course_crn, course_no: number, dept: dept, course_name: name},
			function(data, status){
				console.log(data, status);

			});

		// TODO update global classes object to reflect new comment?

	});
	
	// repo modal
	$(document).on('click', "#createRepoModBtn", function() {

		// get info from modal
		var repo = $("#repo_input").val();
		var desc = $("#desc_input").val();
		
		$.post("GitGrader/php_scripts/add_repo.php", {repo: repo, description: desc},
			function(data, status){
				console.log(data, status);

			});

		// TODO update global classes object to reflect new comment?

	});

	// key modal
	$(document).on('click', "#addKeyModalBtn", function() {

		// get info from modal
		var title = $("#title_input").val();
		var key = $("#ssh_key_input").val();
		
		$.post("GitGrader/php_scripts/add_ssh_key.php", {ssh_title: title, ssh_key: key},
			function(data, status){
				console.log(data, status);

			});

		// TODO update global classes object to reflect new comment?

	});
	/*// add contributor
	$(document).on('click', "#addContributoModalBtn", function() {

		// get info from modal
		var contributor = $("#contributorInput").val();

		$.post("GitGrader/php_scripts/add_comment.php", {contributor: contributor, repo_id: repo_id},
			function(data, status){
				console.log(data, status);

				if (data["success"] == true) {
					console.log("add  successful!");		

					//TODO update comment table
				}
				else {
					console.log("add comment failed, error:", data["error"]["message"]);
				}
			});
			*/

}


function successfulAddAssignment() {

	// add new assignment to DOM
	let name = $("#assignmentFormName").val();
	let outOf = $("#assignmentFormOutOf").val();
	let weight = $("#assignmentFormWeight").val();
	let crn = $("#addAssignmentCRN").val();

	var html = "<a href='#!' class='cyan-text text-darken-2 assignment collection-item' + id='" + name + "'>" + name + "</a>"; 
	$("#assignmentsListDiv").append(html);


	// add new assignment to global classes JSON object
	for (var i=0; i<classes[0].length; i++) {
		if (classes[0][i].CRN == crn) {

			let thisAssignment = {
				ASSIGNMENT_NAME: name,
				WEIGHT: weight, 
				OUTOF: outOf,
				CRN: crn
			};
			classes[0][i].ASSIGNMENTS.push(thisAssignment);
			break;
		}	
	}
}
