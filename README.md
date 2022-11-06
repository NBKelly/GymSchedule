### Workout Templater

This is a minimal tool for building a printable workout schedule. It is based around generating latex from stylesheets and forwarding that to `latexonline.cc` for compilation.

### Why

I don't want to fiddle around with office or latex or anything else to build a workout schedule. I know the basics of what I need (exercises, titles, reps), and anything else should be handled for me an an aesthetically pleasing way.

This is quite minimalist, which is a personal preference. As I need them, I will add more stylesheets to the roster.

This was also a fun exercise in metaprogramming and automation, two of my favourite things.

### How does it work?

You create headings (or blocks), and each heading/block can contain multiple exercises. Exactly how the output looks will be based on the stylesheet you choose, but it should be simple enough.

There is a URL-based restriction of 2048 characters. The stylesheets, in general, take up around 500-700 characters. Generation of documents should be fine up until 5-10 pages, at which point you really aren't using this tool right. If you're having too much trouble, try doing it one page at a time, then using another service to stitch the pdfs together.

There are two "undo" buttons. One clears the last exercise (or does nothing if there is none under the current heading), and the other clears the entire heading, including all exercises.

Try it out at: https://nbkelly.github.io/GymSchedule/

### TODO

* Add more stylesheets as need demands
* Fiddle with the design a little maybe
* There's a chance that `spaghetti.js` needs to be split into multiple files
* Add in a pre-baked exercise selector (requires a dictionary of exercises), which fills out reps based on goals (strength, endurance, hypertrophy, power).
* Add in some pre-baked schedules (a couple of beginner programs, a couple of intermediate programs - basically the things that I use).
