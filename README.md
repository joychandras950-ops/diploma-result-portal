# Diploma Result Portal Hub

A static, roll-only BTEB diploma result search website built from the 18 supplied PDF files.

## Run locally
Because the browser fetches JSON index files, run this folder through a local web server (do not open index.html as a file):
- Python: `python -m http.server 8000`
- Open `http://localhost:8000`

## Publish free with GitHub Pages
1. Create a GitHub repository.
2. Upload the complete contents of this project folder (including `data/` and `pdfs/`).
3. In repository Settings → Pages, deploy from the `main` branch and `/ (root)`.
4. Open the published Pages URL.

## Search behavior
- Search accepts exactly six digits.
- It searches the prebuilt index created from all 18 PDFs and shows matching PDF/page references.
- Each match opens the original PDF at the matching page.
- If a PDF contains a six-digit number in a non-student context, that may also appear; confirm against the original PDF.

## Notes
This is an independent student project, not an official BTEB service. Always verify results against the original BTEB publication.
