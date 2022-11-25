### Workout Templater

This is a minimal tool for building a printable workout schedule. It is based around generating latex from stylesheets and forwarding that to `latexonline.cc` for compilation.

### Why

I don't want to fiddle around with office or latex or anything else to build a workout schedule. I know the basics of what I need (exercises, titles, reps), and anything else should be handled for me in an aesthetically pleasing way.

This is quite minimalist, which is a personal preference. As I need them, I will add more stylesheets to the roster.

This was also a fun exercise in metaprogramming and automation, two of my favourite things.

### Features

* Minimal design allowing for quick design
* Swap between stylesheets without losing any work
* Library of categorized exercises to choose from, with distinct/categorical focuses (hypertrophy, general, competition, etc)
* (TODO) Library of a few pre-baked schedules - I'm basically going to update these as I use them
* Simple/easy structure - a schedule is made up of (maybe) a title, a set of headings, and a set of exercises under each heading
* Simply print off your exercise routine once you're done

### How does it work?

You create headings (or blocks), and each heading/block can contain multiple exercises. Exactly how the output looks will be based on the stylesheet you choose, but it should be simple enough.

~~There is a URL-based restriction of 2048 characters. The stylesheets, in general, take up around 500-700 characters. Generation of documents should be fine up until 5-10 pages, at which point you really aren't using this tool right. If you're having too much trouble, try doing it one page at a time, then using another service to stitch the pdfs together.~~
The latex is sent to a backend, which compiles a tar (latex + supporting content), ships it off to `latexonline` (why couldn't cors just let me make this request...), and then responds with either a compiled latex document or an error code and explanation.

There are two "undo" buttons. One clears the last exercise (or does nothing if there is none under the current heading), and the other clears the entire heading, including all exercises.

Try it out at: https://nbkelly.github.io/GymSchedule/

### TODO

* Output raw latex option (so you can paste it into overleaf)
* Add more stylesheets as need demands
* Fiddle with the design a little maybe
* Expand on the list of prebaked exercises as I need to
* Develop a 'pre-baked schedule' feature
* Add in some pre-baked schedules (a couple of beginner programs, a couple of intermediate programs - basically the things that I use).
* Develop a little tool to make entering pre-baked schedules easy to do
* Decide on a worthwhile name
* Remember how to format nice looking markdown
