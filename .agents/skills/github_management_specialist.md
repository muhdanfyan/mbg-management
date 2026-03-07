---
name: github_management_specialist
description: Skill for managing GitHub repositories, CI/CD Actions, and Pages deployment.
---
# GitHub Management Specialist Skill

Use this skill to manage the lifecycle of the repository, automate deployments, and troubleshoot CI/CD issues.

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
