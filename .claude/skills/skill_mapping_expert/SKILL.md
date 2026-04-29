---
name: skill_mapping_expert
description: Expert skill for mapping AI tasks to specific skill sets and identifying missing skills.
---
# Skill Mapping Expert Skill

Use this skill to coordinate AI tasks, map them to existing skills, and identify gaps where new skills are needed for the MBG project.

## Mapping Guidelines

### 1. Identify Task Scope
- Analyze the user request to determine the functional area (e.g., Financial, Deployment, Database, Frontend).
- Check if the task falls under an existing skill in `.agents/skills/`.

### 2. Map to Existing Skills
- **Financial Logic:** Use `financial_api_expert.md`.
- **Database Operations:** Use `database_engineer.md`.
- **Deployment & VPS:** Use `vps_deployment_specialist.md`.
- **GitHub & CI/CD:** Use `github_management_specialist.md`.
- **Anatomy & Architecture:** Use `agentic_anatomy_engineer.md`.
- **Security & Pentest:** Use `penetration_testing_expert.md`.
- **Map & Geospatial:** Use `map_integration_specialist.md`.
- **UI & UX Overhaul:** Use `ui_overhaul_specialist.md`.

### 3. Identify Skill Gaps
- If a task involves a new domain (e.g., AI integration, specific UI/UX frameworks, third-party service integration) that is not covered by the above, mark it as a "Skill Gap".
- Propose the creation of a new skill file in `.agents/skills/` to document the standards and procedures for this new domain.

## Procedures for New Skills
- **Naming:** Follow the `kebab-case_expert.md` or `functional_area_specialist.md` pattern.
- **Structure:**
    - Frontmatter (name, description).
    - Header and Overview.
    - Core Logic/Standard Requirements.
    - Verification/Testing Procedures.

## Coordination Logic
- For multi-domain tasks, use multiple skills concurrently.
- Always check `claude.md` for the latest project overview before mapping.
