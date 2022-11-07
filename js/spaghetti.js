let Exercise = class {
    constructor(name, reps, reminder, raw_sets, raw_reps, rest) {
	this.name = name; //#1
	this.reps = reps; //#2
	this.reminder = reminder; //#3
	this.raw_sets = raw_sets; //#4
	this.raw_reps = raw_reps; //#5
	this.rest = rest; //#6
    }

    latex(style)   {return style['latex-exercise']
		    .replaceAll('#1', this.name)
		    .replaceAll('#2', this.reps)
		    .replaceAll('#3', this.reminder)
		    .replaceAll('#4', this.raw_sets)
		    .replaceAll('#5', this.raw_reps)
		    .replaceAll('#6', this.rest);}

    display(style, count, index) {
	return this.processDisplay(style, count, index)
	    .replaceAll('#1', this.name)
	    .replaceAll('#2', this.reps)
	    .replaceAll('#3', this.reminder)
	    .replaceAll('#4', this.raw_sets)
	    .replaceAll('#5', this.raw_reps)
	    .replaceAll('#6', this.rest);}

    processDisplay(style, count, index) {
	if(count == 1)
	    return style['display-exercise-only'];
	if(index == 0)
	    return style['display-exercise-first'];
	if(index == count - 1)
	    return style['display-exercise-last'];
	return style['display-exercise'];
    }
}

let Heading = class {
    constructor(name) {
	this.name = name;
	this.exercises = [];
    }

    /* are there any exercises */
    empty() {
	return this.exercises.length == 0;
    }

    /* is this unnamed */
    nameless() {
	return this.name.trim() == "";
    }

    // add an exercise to the set of exercises here
    add(exercise) {this.exercises.push(exercise);}

    //wraps content in a latex container
    latex(style) { return this.selectLatex(style).replaceAll('#1', this.name); }

    /* select the appropriate way to style this item */
    selectLatex(style) {
	if(this.empty() && !this.nameless()) return this.emptyLatex(style);
	if(this.nameless() && !this.empty()) return this.namelessLatex(style);
	if(this.empty() && this.nameless()) return this.emptyNamelessLatex(style);
	return this.normalLatex(style);
    }

    /* process ordinary exercises */
    processLatexExercises(style) {
	var buffer = [];

	this.exercises.forEach((exercise) => buffer.push("\n" + exercise.latex(style)));

	return buffer.join('');
    }

    /* process latex the ordinary way */
    normalLatex(style) {
	return style['latex-heading-opener'] + this.processLatexExercises(style)
	    + style['latex-heading-closer'];
    }

    /* process latex with no heading name */
    emptyNamelessLatex(style) {
	return style['latex-heading-opener-nameless-empty']
	    + style['latex-heading-closer-nameless-empty'];
    }

    /* process latex with no content */
    emptyLatex(style) { return style['latex-heading-opener-empty'] + style['latex-heading-closer-empty']; }

    /* process latex with no name or content */
    namelessLatex(style) {
	return style['latex-heading-opener-nameless'] + this.processLatexExercises(style)
	    + style['latex-heading-closer'];
    }

    display(style) {
	return this.selectDisplay(style).replaceAll('#1', this.name);
    }

    /* process ordinary exercises */
    processDisplayExercises(style) {
	var buffer = [];
	for(var x = 0; x < this.exercises.length; x++)
	    buffer.push(this.exercises[x].display(style, this.exercises.length, x));

	return buffer.join('');
    }

    selectDisplay(style) {
	if(this.empty() && !this.nameless()) return this.emptyDisplay(style);
	if(this.nameless() && !this.empty()) return this.namelessDisplay(style);
	if(this.empty() && this.nameless()) return this.emptyNamelessDisplay(style);
	return this.normalDisplay(style);
    }

    emptyDisplay(style) { return style['display-heading-empty']; }
    emptyNamelessDisplay(style) { return style['display-heading-empty-nameless']; }
    namelessDisplay(style) {
	return style['display-heading-nameless'] + this.processDisplayExercises(style);
    }
    normalDisplay(style) {
	return style['display-heading'] + this.processDisplayExercises(style);
    }
}

let TemplateFocus = class {
    constructor(name, sets, reps, rest, tip){
	this.name = name;
	this.sets = sets;
	this.reps = reps;
	this.rest = rest;
	this.tip = tip;
    };
}
let TemplateExercise = class {
    constructor(name, _focii, tip) {
	this.name = name;
	this.focii = {};
	for( var key in _focii) {
	    var focus = _focii[key]['val'];
	    var _tip =tip;
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

    getFocus(str) {
	return this.focii[str];
    }
}

async function fetchStyles() {
    var addr = "json/pdfsty.json";

    /* I hate web development so much it's unreal */
    if(window.location.protocol == 'file:')
	addr = "https://nbkelly.github.io/GymSchedule/" + addr;

    const res = await fetch(addr)
	  .then((response) => response.json());

    var json = await res;

    return json;
}

async function fetchExercises() {
    var addr = "json/exercises-by-category.json";

    /* I hate web development so much it's unreal */
    if(window.location.protocol == 'file:')
	addr = "https://nbkelly.github.io/GymSchedule/" + addr;

    const res = await fetch(addr)
	  .then((response) => response.json());

    var json = await res;

    return json;
}

var styles = {};
var exercises = {}; //name -> exercise
var categories = new Set();
var exercises_by_category = {}; //cat -> exercise name

async function loadStyles() {
    var select = document.querySelector('#stylesheet');
    var json = await fetchStyles();

    json.schedules.forEach(
	(schedule) => {
	    var opt = document.createElement('option');
	    opt.value = schedule.value;
	    opt.innerHTML = schedule.name;
	    select.appendChild(opt);
	    styles[schedule.value] = schedule;
	});

    styleSelectChanged();
}

async function loadExercises() {
    var select = document.querySelector('#exercise-select');
    var json = await fetchExercises();

    json.exercises.forEach(
	(exercise) => {
	    exercises[exercise['name']] = new TemplateExercise(exercise['name'], exercise['focus'], exercise['tip']);
	    var cats = exercise.categories.forEach(
		(category) => {
		    if(!categories.has(category)) {
			categories.add(category);
			exercises_by_category[category] = [];
		    }
		    exercises_by_category[category].push(exercises[exercise['name']]);
		});
	});

    categories.forEach(
	(cat) => {
	    var group = document.createElement('optgroup');
	    group.label = cat;
	    exercises_by_category[cat].forEach(
		(exercise) => {
		    var opt = document.createElement('option');
		    opt.value = exercise['name'];
		    opt.innerHTML = exercise['name'];
		    group.appendChild(opt);
		});

	    select.appendChild(group);
	});

    exerciseSelectChanged();
}

function spaghettiOnLoad() {
    loadStyles();
    loadExercises();
}

function getStyle() {
    var select = document.querySelector("#stylesheet");
    var value = select.value;
    var style = styles[value];

    return style;
}

function redraw() {
    var style = getStyle();
    displayLatex(style);
    displayTree(style);
}

function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function exerciseSelectChanged() {
    var select = document.querySelector('#exercise-select').value;
    var focii = exercises[select].focii;

    var focusBox = document.querySelector('#exercise-focus-select');
    removeOptions(focusBox);

    for(var focus in focii) {
	var opt = document.createElement('option');
	opt.value = focus;
	opt.innerHTML = focus;
	focusBox.appendChild(opt);
    }


    exerciseFocusChanged();
}

function exerciseFocusChanged() {
    // fill out the exercise fields based on the selected exercise and focus
    var selectedFocus = document.querySelector('#exercise-focus-select').value;
    var selectedExercise = document.querySelector('#exercise-select').value;
    var focus = exercises[selectedExercise].getFocus(selectedFocus);

    // fill out info in sets, reps, rest, reminder, exercise
    document.querySelector('#new_exercise').value = selectedExercise;
    document.querySelector('#sets').value = focus.sets;
    document.querySelector('#reps').value = focus.reps;
    document.querySelector('#rest').value = focus.rest;
    document.querySelector('#reminder').value = focus.tip;
}

function styleSelectChanged() {
    redraw();
    var style = getStyle();
    document.querySelector('#stylesheet-description').innerHTML = style['description'];
}

function titleChanged() {
    redraw();
}

var headings = [];
var activeHeading = null;

function asHTML(str) {
    return str.replaceAll("\n", "<br>");
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function if_real(str) { return (str != null & str.trim().length > 0)}

function push_if_real(str, arr) { if(if_real(str)) arr.push(str);}

function prettyLatex(style) {
    var pretty = [];

    //title
    var title = document.querySelector("#doc-title").value;

    if(if_real(title))
	title = style['latex-title'].replace('#1', title);
    else
	title = style['latex-no-title'];

    push_if_real(title, pretty);

    push_if_real(style['latex-opener'], pretty);

    headings.forEach((heading) => pretty.push(heading.latex(style)));
    push_if_real(style['latex-closer'], pretty);
    return pretty.join('\n');
}

function prettyTree(style) {
    var pretty = [];

    //title
    var title = document.querySelector("#doc-title").value;

    if(if_real(title))
	title = style['display-title'].replace('#1', title);
    else
	title = style['display-no-title'];

    push_if_real(title, pretty);

    headings.forEach((heading) => pretty.push(heading.display(style)));
    return pretty.join('\n');
}

function makeLatex(style) {
    var opener = style['latex-preamble'];

    var full = opener + prettyLatex(style);

    return full;
}

function displayLatex(style) {
    document.querySelector("#output-display").innerHTML = asHTML(escapeHTML(prettyLatex(style)));
}

function displayTree(style) {
    document.querySelector("#output-tree").innerHTML = asHTML(escapeHTML(prettyTree(style)));
}

function addHeading() {
    var heading = new Heading(document.querySelector("#new_heading").value)
    headings.push(heading);
    activeHeading = heading;

    redraw();
}

function addExercise() {
    var reps = "";

    var d_sets = document.querySelector("#sets").value;
    var d_reps = document.querySelector("#reps").value;

    var rest = document.querySelector("#rest").value;
    var reminder = document.querySelector("#reminder").value;

    if(d_sets == 0 || d_reps == 0) {
	var total = parseInt(d_reps) + parseInt(d_sets);
	if(total > 0) {
	    reps = total;
	    d_sets = 1;
	    d_reps = reps;
	}
    }
    else
	reps = d_sets + " x " + d_reps;

    if(activeHeading != null)
	activeHeading.add(new Exercise(document.querySelector("#new_exercise").value, reps, reminder, d_sets, d_reps, rest));

    redraw();
}

function clearExercise() {
    if(activeHeading != null &&
       activeHeading.exercises.length > 0) {
	activeHeading.exercises.pop();
    }

    redraw();
}

function clearHeading() {
    if(headings.length > 0) {
	headings.pop();
	if(headings.length > 0)
	    activeHeading = headings[headings.length - 1];
	else
	    activeHeading = null;
    }

    redraw();
}

function makeURL() {
    var style = getStyle();
    var latex = makeLatex(style);
    console.log("latex: " + latex);
    var url = "https://latexonline.cc/compile?text="
	+ encodeURIComponent(latex);

    return url;
}

function buildWorkout() {
    var url = makeURL();
    console.log(url);
    window.open(url);
}
