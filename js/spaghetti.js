const compile_url = "https://workout-templar-api.herokuapp.com/compile/"
//"http://127.0.0.1:5000/compile/"

let ImagePref = class {
    constructor(name, ext) {
	this.name = name;
	this.ext = ext;
    }
}

let Exercise = class {
    constructor(name, reps, reminder, raw_sets, raw_reps, rest, image) {
	this.name = name; //#1
	this.reps = reps; //#2
	this.reminder = reminder; //#3
	this.raw_sets = raw_sets; //#4
	this.raw_reps = raw_reps; //#5
	this.rest = rest; //#6
	this.image = image; //#7
	this.combined_reps = raw_reps + " x " + raw_sets;
	if (raw_sets == "" || raw_sets == "1")
	    this.combined_reps = raw_reps;
	else if (raw_reps == "")
	    this.combined_reps = raw_sets;
    }

    latex(style)   {
	if(style['supports-image'] && this.image != null)
	    return style['latex-image-exercise']
	    .replaceAll('#1', this.name)
	    .replaceAll('#2', this.reps)
	    .replaceAll('#3', this.reminder)
	    .replaceAll('#4', this.raw_sets)
	    .replaceAll('#5', this.raw_reps)
	    .replaceAll('#6', this.rest)
	    .replaceAll('#7', this.image)
	    .replaceAll('#8', this.combined_reps);

	return style['latex-exercise']
	    .replaceAll('#1', this.name)
	    .replaceAll('#2', this.reps)
	    .replaceAll('#3', this.reminder)
	    .replaceAll('#4', this.raw_sets)
	    .replaceAll('#5', this.raw_reps)
	    .replaceAll('#6', this.rest)
	    .replaceAll('#8', this.combined_reps)
	;}

    display(style, count, index) {
	return this.processDisplay(style, count, index)
	    .replaceAll('#1', this.name)
	    .replaceAll('#2', this.reps)
	    .replaceAll('#3', this.reminder)
	    .replaceAll('#4', this.raw_sets)
	    .replaceAll('#5', this.raw_reps)
	    .replaceAll('#6', this.rest)
	    .replaceAll('#8', this.combined_reps);}

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
    constructor(name, _focii, tip, image) {
	this.name = name;
	this.focii = {};
	this.image = image;
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

    getImage() {
	return this.image;
    }

    getFocus(str) {
	return this.focii[str];
    }
}

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

function dragStart (e) {
    var index = $(e.target).index()
    e.dataTransfer.setData('text/plain', index)
}

function dropped (e) {
    cancelDefault(e)

    // get new and old index
    let oldIndex = e.dataTransfer.getData('text/plain')
    let target = $(e.target)
    let newIndex = target.index()

    if(newIndex == oldIndex)
	return;

    // remove dropped items at old place
    let dropped = $(this).parent().children().eq(oldIndex).remove()

    // insert the dropped items at new place
    if (newIndex < oldIndex) {
	target.before(dropped)
    } else {
	target.after(dropped)
    }
}

function cancelDefault (e) {
  e.preventDefault()
  e.stopPropagation()
  return false
}


var styles = {};
var exercises = {}; //name -> exercise
var exercises_by_category = {}; //cat -> exercise name
var imageOptions = {};
let items = [];

function makePrefs() {
    var imagePrefs = [];
    var listitems = document.querySelectorAll('#imageprefs > li');

    listitems.forEach(
	(item) => {
	    var name = item.innerHTML;
	    imagePrefs.push(imageOptions[name].ext);
	});

    return imagePrefs;
}

async function loadImagePrefs() {
    var tab = document.querySelector('#imageprefs');
    var json = await fetchJson("image-preference");

    json.options.forEach(
	(option) => {
	    imageOptions[option["name"]] = new ImagePref(option["name"], option["ext"]);
	});

    // TODO
    for (const [optName, value] of Object.entries(imageOptions)) {
	var opt = document.createElement('li');
	opt.innerHTML = optName;
	opt.value = optName;
	tab.appendChild(opt);
	items.push(opt);
    };

    items.forEach(item => {
	$(item).prop('draggable', true);
	item.addEventListener('dragstart', dragStart);
	item.addEventListener('drop', dropped);
	item.addEventListener('dragenter', cancelDefault);
	item.addEventListener('dragover', cancelDefault);
    });
}

async function loadStyles() {
    var select = document.querySelector('#stylesheet');
    var json = await fetchJson("pdfsty");

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
    var json = await fetchJson("exercises-by-category");
    var categories = new Set();
    json.exercises.forEach(
	(exercise) => {
	    exercises[exercise['name']] = new TemplateExercise(exercise['name'], exercise['focus'], exercise['tip'], exercise['image']);
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
    loadImagePrefs();
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

    // does the exercise carry an image? say yes
    var imageCheck = document.querySelector('#image');
    if (exercises[selectedExercise].image != null) {
	imageCheck.checked = true;
	imageCheck.disabled = false;
    }
    else {
	imageCheck.checked = false;
	imageCheck.disabled = true;
    }
}

function grayIfUnsupported(element, value) {
    var col = (!value ? 'lightgray' : null);
    document.querySelector(element).style.backgroundColor = col;
}

function styleSelectChanged() {
    redraw();
    var style = getStyle();
    document.querySelector('#stylesheet-description').innerHTML = style['description'];

    // gray out boxes which don't really matter
    grayIfUnsupported('#reminder', style['supports-reminder']);
    grayIfUnsupported('#rest', style['supports-rest']);
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

    var imageCheck = document.querySelector('#image');
    var selectedExercise = exercises[document.querySelector('#exercise-select').value];

    var image = null;
    if(imageCheck.checked)
	image = selectedExercise.image;

    if(activeHeading != null)
	activeHeading.add(new Exercise(document.querySelector("#new_exercise").value, reps, reminder, d_sets, d_reps, rest, image));

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
	activeHeading = (headings.length > 0 ? headings[headings.length - 1] : null);
    }

    redraw();
}


function collectImages(latex) {
    const re = RegExp("images\\/.*\\.(png|jpg)", 'g');
    var res = [];
    let arr1;

    while((arr1 = re.exec(latex)) !== null) {
	res.push(arr1[0]);
    }

    res = [...new Set(res)]

    console.log("images: " + res);
    return res;
}

// Show PDF or Error in other tab
async function showInOtherTab(blob) {
    const url = window.URL.createObjectURL(blob);
    window.open(url);
}

// Construct a workout from the given info
async function buildWorkout() {
    var style = getStyle();
    var latex = makeLatex(style);
    var images = collectImages(latex);
    var prefs = makePrefs();

    console.log("prefs: " + prefs);

    console.log("latex: " + latex);

    const pdf = fetch(compile_url, {
	method: 'POST',
	headers: {
	    'Accept': 'application/pdf',
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify({
	    "latex": latex,
	    "images": images,
	    "imageprefs": prefs
	})
    })
	  .then((response) => response.blob())
	  .then((blob) => showInOtherTab(blob));
}
