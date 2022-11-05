let Exercise = class {
    constructor(name, reps) {
	this.name = name;
	this.reps = reps;
    }

    latex()   {return "  \\exercise{" + this.name + "}{" + this.reps + "}"; }
    display() {return this.name + " (" + this.reps + ")"; }
}

let Heading = class {
    constructor(name) {
	this.name = name;
	this.exercises = [];
    }

    // add an exercise to the set of exercises here
    add(exercise) {this.exercises.push(exercise);}
    //wraps content in a latex container
    latex() {
	var buffer = [];
	buffer.push("\\schedule{" + this.name + "}{");
	for (var j = 0; j < this.exercises.length; j++)
	    buffer.push(this.exercises[j].latex());

	return buffer.join('\n') + "}";
    }
    display() {
	var _name = this.name;
	if (_name == null || _name == "")
	    _name = "[empty]";
	var buffer = [_name];
	for(var k = 0; k < this.exercises.length; k++) {
	    if(k != this.exercises.length - 1)
		buffer.push("├──" + this.exercises[k].display());
	    else
		buffer.push("└──" + this.exercises[k].display());
	}

	return buffer.join('\n');
    }
}

var headings = [];
var activeHeading = null;

function asHTML(str) {
    return str.replaceAll("\n", "<br>");
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function prettyLatex() {
    var pretty = [];
    for(var i = 0; i < headings.length; i++)
	pretty.push(headings[i].latex());
    return pretty.join('\n');
}

function prettyTree() {
    var pretty = [];
    for(var i = 0; i < headings.length; i++)
	pretty.push(headings[i].display());
    return pretty.join('\n');
}


function makeLatex() {
    var opener = "\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[landscape,margin=0.5in]{geometry}\n\\usepackage{multirow}\n\n\\newcommand{\\exercise}[2]{\n    &\\textbf{#1} & #2 &&&&&&&& \\\\ \n    \\mycline}\n\n\\newcommand{\\mycline}[0]{\\cline{2-11}}\n\n\\newcommand{\\schedule}[2]{\n    \\thispagestyle{empty}\n    \n    {\\centering \\Large \\textbf{#1}\\\\}\n    \\noindent\\begin{figure}[h]\n        \\Large\n        \\makebox[\\linewidth]{\n            {\\renewcommand{\\arraystretch}{1.2} %<- modify value to suit your needs\n                \\begin{tabular}{c|p{5cm}|c|p{1.3cm}|p{1.3cm}|p{1.3cm}|p{1.3cm}|p{1.3cm}|p{1.3cm}|p{1.3cm}|p{1.3cm}|}\n                    \\mycline &\\multicolumn{2}{|c|}{\\textbf{Date}} &&&&&&&& \\\\ \n                    \\mycline &\\textbf{Exercise} & \\textbf{Reps} & \\multicolumn{8}{c|}{\\textbf{Load}} \\\\ \n                    \\mycline \n                    #2\\end{tabular}}}\n    \\end{figure}\n}\n\n\\begin{document}";
    var closer = "\n\n\\end{document}";

    var full = opener + prettyLatex() + closer;

    return full;
}

function displayLatex() {
    document.querySelector("#output-display").innerHTML = asHTML(escapeHTML(prettyLatex()));
}

function displayTree() {
    document.querySelector("#output-tree").innerHTML = asHTML(escapeHTML(prettyTree()));
}

function addHeading() {
    var heading = new Heading(document.querySelector("#new_heading").value)
    headings.push(heading);
    activeHeading = heading;
    console.log(headings);
    displayLatex();
    displayTree();
}

function addExercise() {
    var reps = "";

    var d_sets = document.querySelector("#sets").value;
    var d_reps = document.querySelector("#reps").value;

    if(d_sets == 0 || d_reps == 0) {
	var total = parseInt(d_reps) + parseInt(d_sets);
	if(total > 0)
	    reps = total;
    }
    else
	reps = d_sets + " x " + d_reps;

    if(activeHeading != null)
	activeHeading.add(new Exercise(document.querySelector("#new_exercise").value, reps));

    displayLatex();
    displayTree();
}

function clearExercise() {
    if(activeHeading != null &&
       activeHeading.exercises.length > 0) {
	activeHeading.exercises.pop();
    }
    displayLatex();
    displayTree();
}

function clearHeading() {
    if(headings.length > 0) {
	headings.pop();
	if(headings.length > 0)
	    activeHeading = headings[headings.length - 1];
	else
	    activeHeading = null;
    }

    console.log(headings);

    displayLatex();
    displayTree();
}

function makeURL() {
    var url = "https://latexonline.cc/compile?download=schedule.pdf&text="
	+ encodeURIComponent(makeLatex());

    return url;
}

function buildWorkout() {
    var url = makeURL();
    console.log(url);
    window.open(url);
}
