# Simple Resume Builder (Express + File Storage)

This project builds a beginner-friendly **Resume Builder Website** using only:
- Frontend: **plain HTML, CSS, JavaScript** (no frameworks)
- Backend: **Node.js + Express**
- Storage: **local file-based JSON** (no MongoDB / no external database)
- Download: **PDF generated from server-side HTML** using **Puppeteer**

## Folder Structure
```
d-resume-builder-new/
  frontend/                  # HTML/CSS/JS for the UI
    index.html
    styles.css
    app.js
  backend/                   # Express server + APIs
    server.js
    resumeTemplates.js
    package.json
  storage/                   # Saved resumes as JSON files
    resumes/
  README.md
```

## What the app does
1. User fills the resume form in the browser.
2. The form auto-saves a **draft** in `localStorage`.
3. The user can:
   - Preview the resume (rendered HTML) in an iframe
   - Save the resume to `storage/resumes/<id>.json`
   - Edit a saved resume (load it back into the form)
   - Download a resume as **PDF**
4. The server generates clean resume HTML using **two templates**:
   - `template1` (clean)
   - `template2` (modern)
  - `template3` (classic single-column)

## How to run locally
1. Open **PowerShell**.
2. Go to the backend folder:
   - `cd d:\resume_builder_new\backend`
3. Install dependencies:
   - `npm install`
4. Start the server:
   - `npm start`
5. Open your browser:
   - `http://localhost:3000`

## Notes about PDF generation (Puppeteer)
- The first time you run `npm install`, Puppeteer may download Chromium (can take a few minutes).
- If you face any Puppeteer install issues, tell me your error log and I’ll help you adjust it for Windows.

