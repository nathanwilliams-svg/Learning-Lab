# Nipher Python Coding Lab

Student site: https://nathanwilliams-svg.github.io/Learning-Lab/python-lab/

## Curriculum
**132 progressive coding missions in 22 units** across three levels:
- Beginner (42): printing, strings, variables, arithmetic, numeric conversion, formatted strings, and comparisons
- Intermediate (48): if / else / elif, for loops, range, lists, indexing, and appending
- Advanced (42): while loops, functions, return, dictionaries, string methods, enumerate, and try/except

Each mission now includes a **Learn before you code** section, conceptual explanation, worked example, step-by-step directions, a common mistake, an editable starter, optional hint, expected output, and checkable answer.

## Using school iPads
The Python editor has touch controls for indent, outdent, new line, colon, parentheses, and quote marks. These complement physical keyboards that may not work reliably. The student may press Run or Check without keyboard shortcuts.

Actual Python is powered by the Pyodide WebAssembly runtime in a Web Worker. First use requires access to https://cdn.jsdelivr.net/pyodide/v314.0.7/full/ (including runtime .wasm and Python standard library files). Some school filters may block it. Modern Safari / iPadOS is recommended. A full live iPad runtime test has not been completed.

Progress/drafts are saved to the browser localStorage on that iPad only. Deleting browser storage or switching devices can lose progress. Use Print progress for student evidence. **No student login or cloud roster is included.**

## Assessment/limitations
The app checks expected console output and use of the lesson's target syntax, but does not fully inspect program logic. It is practice, not a secure graded exam. Source answers are visible in browser JavaScript. Teacher settings are local to the device, not remote controls.

## Shared design
The interface uses ../shared/lab.css and ../shared/lab.js. The curriculum data is in course.js, the controller in app.js, and Python execution in worker.js. Keep all these files together in the repository.
