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


## November 9, 2026 — UI and mission polish

This pass updates the game **without replacing** the established title, artwork assets, direct-link Start Mission behavior, or the original three Python lesson topics.

- `src/workbench-upgrade.css`: new castle-themed workbench layout, code editor styling, bright Run/Stop/Reset controls, mission cards, feedback console, iPad breakpoints, and crystal counter.
- `src/main.js`: mission unlock checks; disabled previous/next states; illustrated gameplay environment for Missions 2 and 3 (cropped from the separately uploaded gameplay reference), animation-run guard, and revised XP/crystal display.
- `src/adventure-ui.js`: clickable Academy region on the illustrated map, clearer locked/completed/ready labels, replay-aware reward amounts, corrected achievement counts.
- `src/adventure-ui.css`: improved later-mission briefing, map, rewards, profile and achievement styles.

### Automated checks performed
- JavaScript syntax checks for the main game, menu code, and Python worker.
- Menu rendering smoke tests with mocked browser objects: title, world map, briefings 1–3, victory, profile, achievements, help.
- Mission progression checks with mocked browser objects: Mission 1 opens; Mission 2 stays locked until 1 is complete; Mission 3 stays locked until 2 is complete.
- Checked that the direct Start Mission link is still present and no duplicate Start button markup was added.

These checks do not constitute physical iPad, live GitHub Pages, Phaser rendering, or end-to-end Pyodide browser tests. Those still require an actual browser playthrough.

### Browser playthrough checklist
1. Load the game and select **Play Adventure**.
2. Choose the academy island, open Mission 1, and tap its *single* Start Mission button.
3. Wait for **Python ready**, enter `print("Wake up, RoboKnight!")`, and press **Run Code**.
4. Verify the victory screen gives 50 XP only the first time and allows continuing.
5. Run Mission 2 with three `robot.move_forward()` commands; verify movement, crystal, and 75 XP.
6. Run Mission 3 with `for i in range(4):` followed by an indented `robot.move_forward()`; verify 100 XP.
7. Check map lock states, achievement counts, menu navigation, replay reward amounts, and iPad landscape controls.
8. Check whether the page is allowed through the district web filter and whether the Pyodide/Phaser CDNs are reachable.

### Remaining visual limitations
The forest gameplay background is cropped from an illustration, while the moving RoboKnight remains a separate vector asset. Full high-resolution walk-cycle sprite sheets, individually layered environment tiles, and production audio are not yet integrated. The editor currently uses a robust native textarea; CodeMirror loading is attempted but it is not yet used for rendering the editor.
