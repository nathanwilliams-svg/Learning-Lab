# RoboKnight Adventure — The Lost Code

A three-mission Python coding adventure for middle school students. Part of the Nipher Interactive Learning Lab.

## Current gameplay
- Illustrated title screen, adventure map, mission briefings, coding workbench, win celebration, and achievements.
- Missions: The Sleeping Knight (print), The Crystal Path (methods/sequencing), The Bridge of Loops (for loop).
- Real Python 3 executed in Pyodide web worker, with a restricted command API and a timeout/restart mechanism.
- Phaser animation of a RoboKnight, and responsive buttons for iPad users.
- Local progress and code storage; no student accounts or cloud data storage.

## Important notes
This version is a playable **visual upgrade prototype**, not a complete 120-mission game. The user-provided generated art is a **visual reference**; the production scene currently uses separately constructed vector assets under assets/. Converting the full generated illustration into original transparent animated sprites and separately layered environmental artwork remains an open art-production task. The screen overlays are genuine HTML controls, not a sliced screenshot.

The coding editor uses a native textarea fallback because some school networks block external editor modules. A full CodeMirror upgrade is still planned. Pyodide and Phaser need access to their configured CDN hosts for first load. The app has not been verified on physical iPads in this environment.

## Architecture
- index.html: base game screen
- src/main.js: mission progression, editor, Python interactions, Phaser scenes
- src/python-worker.js: Pyodide bootstrap and restricted game API
- src/adventure-ui.js: title, world map, briefing, results, achievements
- src/style.css and src/adventure-ui.css: responsive styles and presentation
- assets/academy.svg, assets/knight.svg: in-game illustrated vector assets

## Testing
1. Open /Learning-Lab/roboknight-adventure/ on GitHub Pages.
2. Select Play Adventure > Knight Academy > Mission 1.
3. Run print("Wake up, RoboKnight!"). It should show a celebration and 50 XP.
4. In Mission 2, use robot.move_forward() three times.
5. In Mission 3, use a for loop to move forward four times.
6. Confirm progress is still saved after refresh; test reset and Stop.
7. Try on an iPad in landscape. If runtime says unavailable, check if your district blocks the CDN.

The other Learning Lab applications are not modified by this folder.
