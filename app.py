from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)


GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')


REPOS = {
    'drive-frontend': {
        'owner': os.getenv('GITHUB_OWNER', 'default-owner'),
        'repo': 'drive-frontend'
    },
    'drive': {
        'owner': os.getenv('GITHUB_OWNER', 'default-owner'),
        'repo': 'drive'
    },
    'tesseract': {
        'owner': os.getenv('GITHUB_OWNER', 'default-owner'),
        'repo': 'tesseract'
    }
}


BRANCH_CONFIGS = {
    'preprod': {
        'head': 'staging-v2',
        'base': 'preprod-v2'
    },
    'prod': {
        'head': 'preprod-v2',
        'base': 'main-v2'
    }
}

@app.route('/')
def index():
    return render_template('index.html')

def create_pull_request(owner, repo, title, head, base):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    payload = {
        'title': title,
        'head': head,
        'base': base,
        'body': f'Automated PR created by PRWizard\nHead branch: {head}\nBase branch: {base}'
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json(), response.status_code

@app.route('/create-prs', methods=['POST'])
def create_prs():
    data = request.get_json()
    pr_title = data.get('title', 'Automated PR')
    pr_type = data.get('type')  
    
    if not pr_title or not pr_type or pr_type not in BRANCH_CONFIGS:
        return jsonify({'error': 'Missing or invalid parameters'}), 400
    
    head = BRANCH_CONFIGS[pr_type]['head']
    base = BRANCH_CONFIGS[pr_type]['base']
    
    results = {}
    for repo_key, repo_info in REPOS.items():
        owner = repo_info['owner']
        repo = repo_info['repo']
        
        response_data, status_code = create_pull_request(owner, repo, pr_title, head, base)
        
        if status_code >= 400:
            results[repo] = {
                'success': False,
                'message': response_data.get('message', 'Unknown error'),
                'url': None
            }
        else:
            results[repo] = {
                'success': True,
                'message': 'PR created successfully',
                'url': response_data.get('html_url', '')
            }
    
    return jsonify(results)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False) 