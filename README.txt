DIPLOMA RESULT PORTAL — SETUP

Files:
- index.html                 Main page
- style.css                  Responsive design
- app.js                     Search and result rendering logic
- results-index.json.gz      Compressed result index (164,325 roll keys)

HOW TO RUN
1. Keep all four files in the same folder.
2. Upload the folder contents to your hosting / GitHub repository root.
3. Open the site through a web server (GitHub Pages is supported).
4. Do not open index.html directly as file://; browsers block fetch() for local files.
5. Search a roll number. The page loads and decompresses results-index.json.gz in the browser.

DEMO ROLL: 745331
The included data record contains semester GPA values for semesters 1–7 and no CGPA value.

NOTE
This is a front-end portal using the supplied compressed index. It does not include official authentication,
result editing, or a server-side API. The source dataset should be checked before public deployment.
