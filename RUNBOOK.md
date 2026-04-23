# RUNBOOK - road trip planner
Backend: Kotlin + Ktor + Exposed + SQLite

## Prerequisites
- [ ] JDK 21+: `java -version`
- [ ] Node.js 18+: `node --version`
- [ ] gh CLI authenticated: `gh auth status`
- [ ] All output files present: `design.md`, `frontend_output.md`, `backend_output.md`, `REVIEW.md`

## Before Running - Merge the Review PR
The review agent opens a `fix/review-agent` pull request on your GitHub repo.
Read the PR comments, review the diff, and merge it before running the app locally.

## Step 1 - Pull the latest code (after merging the review PR)
```bash
git pull origin main
```

## Step 2 - Start the Backend (Kotlin/Ktor)
```bash
cd backend
./gradlew run
```
Windows:
```powershell
cd backend
gradlew.bat run
```
API runs at: `http://localhost:3001`

First run downloads Gradle dependencies and may take 1-2 minutes.

## Step 3 - Start the Frontend (React/Vite)
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

## Step 4 - Open in Browser
`http://localhost:5173`

## Resetting the Database
Mac/Linux:
```bash
rm backend/data/app.db
```
Windows:
```powershell
del backend\data\app.db
```
Restart backend to recreate tables and sample seed data.
