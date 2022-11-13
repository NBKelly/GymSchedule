let TemplateFocus = class {
    constructor(name, sets, reps, rest, tip){
	this.name = name;
	this.sets = sets;
	this.reps = reps;
	this.rest = rest;
	if(tip != null)
	    this.tip = tip;
    };
}
let TemplateExercise = class {
    constructor(name, _focii, tip, image, categories) {
	this.name = name;
	this.focii = {};
	if(image != null)
	    this.image = image;
	this.categories = categories;
	this.tip = tip;
	for( var key in _focii) {
	    var focus = _focii[key]['val'];
	    if(focus == null)
		focus = _focii[key];
	    var _tip = null;
	    if(focus.hasOwnProperty['tip'])
		_tip = focus['tip'];

	    var fname = _focii[key]['name'];
	    this.focii[fname] = new TemplateFocus(fname,
						  focus['sets'],
						  focus['reps'],
						  focus['rest'],
						  _tip);
	}
    }

    getImage() {
	return this.image;
    }

    getFocus(str) {
	return this.focii[str];
    }
}

var exercises = {}

async function fetchJson(str) {
    var addr = "json/" + str + ".json";

    /* Love from Kazakhstan
       This is required so I can actually load files from a local html file
       I hate web development so much it's unreal */
    if(window.location.protocol == 'file:')
	addr = "https://nbkelly.github.io/GymSchedule/" + addr;

    const res = await fetch(addr)
	  .then((response) => response.json());

    var json = await res;

    return json;
}

/* load all exercises from json */
function redrawExercises() {
    var select = document.querySelector('#selectExercise');
    $("#selectExercise").empty();

    //select.children = [];//clear();

    for (var exercise in exercises) {
	console.log(exercise);
	var opt = document.createElement('option');
	opt.value = exercise;
	opt.innerHTML = exercise;
	select.appendChild(opt);
    }
}

async function loadExercises() {
    var select = document.querySelector('#selectExercise');
    var json = await fetchJson("exercises-by-category");
    json.exercises.forEach(
	(exercise) => exercises[exercise['name']]
	    = new TemplateExercise(exercise['name'], exercise['focus'],
				   exercise['tip'], exercise['image'],
				   exercise['categories'].sort()));

    redrawExercises();
}

function editorOnLoad() {
    loadExercises();
}

function makeInput(placeholder, value, width) {
    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.value = value;
    input.size = width;
    return input;
}

function addFocusRow(name, reps, sets, rest, tip) {
    var table = document.querySelector('#focusTable');

    var row = table.insertRow();

    var cellName = row.insertCell(0);
    var cellSets = row.insertCell(1);
    var cellReps = row.insertCell(2);
    var cellRest = row.insertCell(3);
    var cellTip = row.insertCell(4);
    var cellDelete = row.insertCell(5);

    cellName.appendChild(makeInput("Boxing Fitness", name, 15));
    cellSets.appendChild(makeInput("3", sets, 8));
    cellReps.appendChild(makeInput("10", reps, 8));
    cellRest.appendChild(makeInput("60s", rest, 8));
    cellTip.appendChild(makeInput("Strike hard. Strike first.", (tip == null ? "" : tip), 30));

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete Focus";
    deleteButton.className = "button button2";
    deleteButton.size = 15;
    deleteButton.onclick = function() {
	table.removeChild(row);
    }

    cellDelete.appendChild(deleteButton);
}

function addFocus() {
    addFocusRow("", "", "", "", "");
}

function saveExercise() {
    var table = document.querySelector('#focusTable');
    let extractVal = function(row, cell) {
	return row.cells[cell].children[0].value.trim();
    }

    var focii = {};

    for (var i = 0, row; row = table.rows[i]; i++) {
	var fname = extractVal(row, 0);
	var fsets = extractVal(row, 1);
	var freps = extractVal(row, 2);
	var frest = extractVal(row, 3);
	var ftip = extractVal(row, 4);
	if(ftip.length == 0)
	    ftip = null;

	var focus = new TemplateFocus(fname, fsets, freps, frest, ftip);
	focii[fname] = focus;
    }

    var exerciseName = document.querySelector('#exerciseName').value;
    var categories = document.querySelector('#categories').value.split(",").map((x) => x.trim());
    var tip = document.querySelector('#exerciseTip').value;
    var image = document.querySelector('#image').value;
    if(image.trim().length < 1)
	image = null;

    var exercise = new TemplateExercise(exerciseName, focii, tip, image, categories);
    exercises[exerciseName] = exercise;
    redrawExercises();
}

function deleteExercise() {
    var selected = document.querySelector('#selectExercise').value;

    exercises.delete(selected);
    redrawExercises();
}

function newExercise() {
    //clear the table
    $("#focusTable").empty();

    var name = document.querySelector('#exerciseName').value = "";
    var cats = document.querySelector('#categories').value = "";
    var tip = document.querySelector('#exerciseTip').value = "";
    var image = document.querySelector('#image').value = "";
}

/* load a specific exercise */
function loadExercise() {
    //get the item from the select, if any
    var select = document.querySelector('#selectExercise');
    var exercise = exercises[select.value];
    console.log(exercise);

    var name = document.querySelector('#exerciseName');
    var cats = document.querySelector('#categories');
    var tip = document.querySelector('#exerciseTip');
    var image = document.querySelector('#image');

    name.value = exercise.name;
    cats.value = exercise.categories.join(', ');
    tip.value = exercise.tip;
    image.value = (exercise.image != undefined ? exercise.image : "");

    //clear the table
    $("#focusTable").empty();

    for (focus in exercise.focii) {
	focus = exercise.getFocus(focus);
	console.log(focus);
	addFocusRow(focus['name'], focus['reps'],
		    focus['sets'], focus['rest'], focus['tip']);
    }
}

function showJSON() {
    var objExercises = [];
    var obj = {"exercises": objExercises};
    for (key in exercises) {
	var ex_plain = exercises[key];
	var focuses = [];
	for (var fkey in ex_plain.focii) {
	    var o_focus = ex_plain.focii[fkey];
	    console.log(o_focus);
	    var new_map = {...o_focus}
	    delete new_map.name;
	    var m_focus = {"name": o_focus.name,
			   "val": new_map};
	    focuses.push(m_focus);
	}

	var ex = {"name": ex_plain.name,
		  "categories": ex_plain.categories,
		  "tip": ex_plain.tip,
		  "focus": focuses};

	objExercises.push(ex);
    }

    var jsonWindow = window.open("data:text/json," + encodeURIComponent(JSON.stringify(obj)),
				 "_blank");
    jsonWindow.focus();
}
