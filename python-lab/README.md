# Nipher Python Coding Lab

Student page: https://nathanwilliams-svg.github.io/Learning-Lab/python-lab/

## Lessons
- Beginner: print, variables, multiplication, strings
- Intermediate: comparisons, if/else, for/range, lists
- Advanced: functions, while loops, conditional logic, final robot mission

## How it works
The editor runs actual Python 3 in a **Web Worker** using the Pyodide WebAssembly runtime. The app is hosted by GitHub Pages. The first visit needs an internet connection and access to:
- https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js
- Other files under https://cdn.jsdelivr.net/pyodide/v314.0.7/full/

If the school filters jsDelivr, the code editor loads but Python cannot start until the domain is allowed or the runtime is self-hosted. Student browser data is stored in localStorage on each device; it does not sync to teacher devices or upload code to ChatGPT. The teacher settings are local and not password protected.

## Student workflow
Choose a level, edit code, click Run code, compare the output, and click Check mission. Complete each of the twelve missions to reach 120 points. Ctrl+Enter runs code. Students may print a progress summary.

## Safety / limitations
This is a learning tool, not a secure coding sandbox or locked examination. Run only classroom practice code. The teacher can cap execution time and disable hints. Long-running programs run in a worker that the browser can stop. The grading tests are visible in client-side JavaScript, so do not use the score as sole evidence for graded assessments.

The interface reuses ../shared/lab.css and ../shared/lab.js so subsequent classroom apps maintain a consistent appearance.
