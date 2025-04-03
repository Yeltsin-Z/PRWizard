# PRWizard

A simple web application to create GitHub pull requests across multiple repositories with a single click.

## Features

- Create pull requests for three repositories simultaneously: `drive-frontend`, `drive`, and `tesseract`
- Two PR creation options:
  - **Preprod Cut**: Compare `staging-v2` → `preprod-v2`
  - **Prod Release**: Compare `preprod-v2` → `main-v2`
- Simple interface with a single input field for PR title

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
2. Open your browser and navigate to `http://localhost:5000`
3. Enter a title for your pull requests
4. Click either:
   - "Create PRs for Preprod Cut" button 
   - "Create PRs for Prod Release" button
5. View the results directly in the interface with links to created pull requests

## Requirements

- Python 3.7+
- GitHub personal access token with repo permissions

## License

MIT 