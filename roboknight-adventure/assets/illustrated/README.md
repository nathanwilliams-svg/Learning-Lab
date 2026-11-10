# RoboKnight illustrated assets

This folder is ready for six optimized artwork files generated for the project:

- `title.webp`
- `map.webp`
- `briefing.webp`
- `gameplay.webp`
- `victory.webp`
- `achievements.webp`

The illustrated title screen, map, Mission 1 briefing, and Mission 1 reward display are already wired to these asset names. The game detects whether the files exist and retains the existing screens if they do not.

**To complete installation:** GitHub → this folder → **Add file → Upload files** → drag the six .webp files from the downloaded art pack → Commit changes. Do not upload the ZIP without extracting it.

Original 1672×941 illustrations have been compressed to WebP for faster loading. The current 3-mission gameplay still uses Phaser and a Pyodide Web Worker. The screenshot-like `gameplay.webp` is a visual reference, not yet a layered game scene; it is not displayed in the live Phaser stage.

These are prototype illustrations. For further animation, assets should be redrawn or segmented into transparent sprites, level tiles, and separate interface pieces.
