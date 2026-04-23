---
name: build-app
description: Orchestrate the full four-agent workflow to generate a complete full-stack app in this repository using the prompts files and extraction script. Use when asked to turn a one-line app idea into design.md, frontend_output.md, backend_output.md, extracted frontend and backend code, a pushed GitHub repo, a review PR from fix/review-agent, and RUNBOOK.md.
---

# Build App

Execute this workflow from the repository root that contains `prompts/` and `scripts/extract_files.py`.

## Inputs

- Require a one-line project idea.
- Treat that value as `PROJECT_IDEA`.
- If the user did not provide an idea, ask for it before starting.

## Preconditions

1. Confirm these files exist:
   - `prompts/01_design_agent.md`
   - `prompts/02_frontend_agent.md`
   - `prompts/03_backend_agent.md`
   - `prompts/04_review_agent.md`
   - `scripts/extract_files.py`
2. Confirm these tools are available: `git`, `gh`, `python3`.
3. Before GitHub operations, run `gh auth status` and stop with clear guidance if not authenticated.

## Step 1 - Design Agent

1. Read `prompts/01_design_agent.md`.
2. Replace `{PROJECT_IDEA}` with `PROJECT_IDEA`.
3. Execute those instructions and save the complete output to `design.md`.
4. Verify required sections before continuing:

```bash
grep "^## API Spec\|^## DB Schema\|^## Component Tree" design.md
```

5. If any section is missing, revise `design.md` first.

## Step 2 - Frontend Agent

1. Read `prompts/02_frontend_agent.md` and `design.md`.
2. Execute instructions exactly and save the complete output to `frontend_output.md`.
3. Extract files:

```bash
python3 scripts/extract_files.py frontend_output.md
echo "frontend_output.md saved, frontend/ extracted"
```

## Step 3 - Backend Agent

1. Read `prompts/03_backend_agent.md` and `design.md`.
2. Execute instructions exactly, including intentional bug requirements in the prompt, and save the complete output to `backend_output.md`.
3. Extract files:

```bash
python3 scripts/extract_files.py backend_output.md
echo "backend_output.md saved, backend/ extracted"
```

## Step 4 - Create and Push GitHub Repository

1. Derive a URL-safe slug from `PROJECT_IDEA`:

```bash
SLUG=$(echo "$PROJECT_IDEA" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
```

2. Initialize and commit generated artifacts:

```bash
git init
git add design.md frontend_output.md backend_output.md frontend/ backend/ scripts/ prompts/ RUNBOOK.md 2>/dev/null || true
git commit -m "feat: multi-agent generated app - $PROJECT_IDEA"
```

3. Create and push a public GitHub repository:

```bash
gh repo create "$SLUG" --public --source=. --remote=origin --push
REPO_URL=$(gh repo view "$SLUG" --json url --jq .url)
echo "GitHub repo: $REPO_URL"
```

4. If the repository already exists, connect `origin` and push without rewriting history.

## Step 5 - Review Agent

1. Read `prompts/04_review_agent.md`.
2. Use `design.md`, `frontend_output.md`, and `backend_output.md` as context.
3. Execute the instructions and save output to `REVIEW.md`.
4. Ensure the process creates branch `fix/review-agent` and opens a PR against `main`.
5. Tell the user to review and merge that PR before running the app locally.

## Step 6 - Write RUNBOOK.md

Write `RUNBOOK.md` with these sections and commands:

1. Title: `RUNBOOK - PROJECT_IDEA`.
2. Stack line: `Backend: Kotlin + Ktor + Exposed + SQLite`.
3. Prerequisites checklist for JDK 21+, Node.js 18+, authenticated `gh`, and required output files.
4. Instruction to merge the `fix/review-agent` PR before local run.
5. Backend startup commands from `backend/`:
   - Mac/Linux: `./gradlew run`
   - Windows: `gradlew.bat run`
6. Frontend startup commands from `frontend/`:
   - `npm install`
   - `npm run dev`
7. Local app URL: `http://localhost:5173`.
8. Database reset commands:
   - Mac/Linux: `rm backend/data/app.db`
   - Windows: `del backend\\data\\app.db`

## Step 7 - Final Summary

Print a completion summary with line counts:

```bash
echo ""
echo "========================================="
echo " /build-app complete - $PROJECT_IDEA"
echo "========================================="
echo " design.md          $(wc -l < design.md) lines"
echo " frontend_output.md $(wc -l < frontend_output.md) lines"
echo " backend_output.md  $(wc -l < backend_output.md) lines"
echo " REVIEW.md          $(wc -l < REVIEW.md) lines"
echo " RUNBOOK.md         written"
echo ""
echo " Backend stack: Kotlin + Ktor + Exposed + SQLite"
echo ""
echo " GitHub:"
echo "   main branch  - generated app code"
echo "   fix/review-agent PR - review fixes to approve and merge"
echo ""
echo " Next: review and merge the PR, then follow RUNBOOK.md"
echo "========================================="
```
