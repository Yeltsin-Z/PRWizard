# PRWizard

A modern web application to create and track GitHub pull requests across multiple repositories with a single click.

## Features

- Create pull requests for three repositories simultaneously: `drive-frontend`, `drive`, and `tesseract`
- Two PR creation options:
  - **Preprod Cut**: Compare `staging-v2` → `preprod-v2`
  - **Prod Release**: Compare `preprod-v2` → `main-v2`
- Simple interface with a single input field for PR title
- Modern UI with elegant animations and responsive design
- Real-time PR status tracking including:
  - Approval status (number of approvals)
  - Merge conflicts detection
  - Review requirements
  - CI/CD pipeline status (success, failure, pending)
- Ability to refresh PR status with a single click

## Installation

1. Clone this repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your GitHub access token (see `.env.example` for the format)

## Configuration

1. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```
2. Edit the `.env` file and add:
   - Your GitHub personal access token (with `repo` permissions)
   - Your GitHub organization or username that owns the repositories

## Usage

1. Start the application:
   ```
   python app.py
   ```
2. Open your browser and navigate to `http://localhost:8081`
3. Enter a title for your pull requests
4. Click either:
   - "Create PRs for Preprod Cut" button 
   - "Create PRs for Prod Release" button
5. View the results directly in the interface with links to created pull requests
6. Track PR status automatically - the status indicators will show:
   - 🟢 Approved (with approval count)
   - 🔴 Conflicts (if merge conflicts detected)
   - 🟠 Changes Requested (if reviewers requested changes)
   - 🔵 CI Running (if CI pipelines are in progress)
   - 🟢 CI Passed (if all CI checks passed)
   - 🔴 CI Failed (if any CI checks failed)
   - ⚪ Review Needed (if no reviews yet)
7. Click "Refresh Status" button anytime to get the latest PR status

## Technical Features

- Built with Flask (backend) and vanilla JavaScript (frontend)
- Utilizes GitHub API for PR creation and status tracking
- Responsive design that works on desktop and mobile devices
- Clean and modern UI with subtle animations and transitions
- Real-time status indicators for all created pull requests
- Elegant error handling with clear user feedback

## API Endpoints

- `GET /` - Main application interface
- `POST /create-prs` - Creates pull requests across multiple repositories
- `POST /pr-status` - Fetches detailed status information for pull requests

## Requirements

- Python 3.7+
- GitHub personal access token with repo permissions
- Internet connection to access GitHub API

## License

MIT 