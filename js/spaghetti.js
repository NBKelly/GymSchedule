let Exercise = class {
    constructor(name, reps, reminder,
		raw_sets, raw_reps, rest) {
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

var styles = {};

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

    selectChanged();
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

function selectChanged() {
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

    push_if_real(style['latex-opener'], pretty);

    push_if_real(title, pretty);

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
    var closer = style['latex-closer'];

    var full = opener + prettyLatex(style) + closer;

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
