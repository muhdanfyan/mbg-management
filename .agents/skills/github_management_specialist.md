---
name: github_management_specialist
description: Skill for managing GitHub repositories, CI/CD Actions, and Pages deployment.
---
# GitHub Management Specialist Skill

Use this skill to manage the lifecycle of the repository, automate deployments, and troubleshoot CI/CD issues.

## Authentication Methods

### 1. GitHub CLI (Recommended for Development)
Most operations in this skill utilize the `gh` tool.
- Run `gh auth login` to authenticate via browser (OAuth).
- **PAT not required** if authenticated this way.

### 2. SSH (Recommended for Git Operations)
- Use SSH keys for `git push/pull`.
- **PAT not required** for SSH-based git interactions.

### 3. Personal Access Token (PAT)
- **Required for:** Scripted API access without `gh`, or using git over HTTPS.
- **Scope needed:** `repo`, `workflow`, `write:packages`.
- **Storage:** Never hardcode tokens; store them in environment variables or as GitHub Secrets.

## Core Responsibilities

### 1. Repository Configuration
- **Visibility Check:** Verify if the repo is Public or Private (`gh repo view --json isPrivate`).
- **Pages Eligibility:** Remember that GitHub Pages is only free for **Public** repositories. For Private ones, suggest alternative hosting (VPS, Vercel) or upgrading to GitHub Pro.

### 2. GitHub Actions (CI/CD)
- **Workflow Management:** Monitor runs using `gh run list --workflow <filename>`.
- **Debugging:** View failed logs using `gh run view <run_id> --log`.
- **Secret Management:** Securely handle API keys or VPS credentials using `gh secret set <name>`.

### 3. Deployment Automation
- **GitHub Pages:** Ensure `vite.config.ts` has the correct `base` path (usually `/<repo-name>/`).
- **Release Management:** Create versioned tags and releases using `gh release create`.

## Common Commands
```bash
# Check Pages status
gh api repos/:owner/:repo/pages

# List last 5 workflow runs
gh run list --limit 5

# Set a secret for VPS deployment
gh secret set VPS_PASSWORD -b "Piblajar2020"
```
