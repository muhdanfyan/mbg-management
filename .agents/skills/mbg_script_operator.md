---
name: mbg_script_operator
description: Skill for running MBG Management system lifecycle scripts, including local development and remote VPS deployment.
---
# MBG Script Operator Skill

This skill allows the agent to manage the development and deployment lifecycle of the MBG Kitchen Management project using pre-defined shell scripts.

## Core Scripts

| Script | Location | Purpose | Execution Command |
| :--- | :--- | :--- | :--- |
| **Dev Environment** | `./dev.sh` | Starts both Go backend (with Air) and Vite frontend. | `bash ./dev.sh` |
| **Auto Deployment** | `./deploy_auto.sh` | Full automated deployment to VPS `103.126.117.20`. | `bash ./deploy_auto.sh` |
| **Standard Deployment**| `./deploy_to_vps.sh` | Manual/Stage-based deployment to VPS. | `bash ./deploy_to_vps.sh` |

## Execution Guidelines

### 1. Local Development (`dev.sh`)
- **Action**: Runs backend (`air`) and frontend (`npm run dev`) in parallel.
- **Pre-requisite**: Ensure Go and Node.js are installed locally.
- **Hot-Reload**: The script handles process cleanup automatically on exit.

### 2. VPS Deployment (`deploy_auto.sh`)
- **Action**: Syncs `backend/` folder to the VPS and restarts Docker containers.
- **Account**: `mbgone@103.126.117.20`
- **Password**: Provided in the script configuration (`Piblajar2020`).
- **Dependencies**: Requires `sshpass` installed on the local system.

### 3. VPS Preparation
Before deployment, ensure the target VPS has the following installed:
- **Node.js 18+**
- **Docker & Docker Compose**
- **@google/gemini-cli**

## Troubleshooting

- **Port in Use**: If port `8080` (Backend) or `5173` (Frontend) is occupied, `dev.sh` will attempt to kill the existing process.
- **SSH Permission Denied**: Ensure the password is correct or use the `mbg` key pair if configured.
- **Build Failures**: Check `backend/main.go` for Go errors and `src/` for Vite/TypeScript errors.
