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

def get_pull_request_status(owner, repo, pr_number):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    # Get basic PR info
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None, response.status_code
    
    pr_data = response.json()
    
    # Get PR reviews to check approval status
    reviews_url = f"{url}/reviews"
    reviews_response = requests.get(reviews_url, headers=headers)
    reviews = []
    if reviews_response.status_code == 200:
        reviews = reviews_response.json()
    
    # Check for merge conflicts
    mergeable = pr_data.get('mergeable', None)
    mergeable_state = pr_data.get('mergeable_state', 'unknown')
    
    # Get PR status checks
    statuses_url = pr_data.get('statuses_url', '')
    statuses_response = requests.get(statuses_url, headers=headers)
    statuses = []
    if statuses_response.status_code == 200:
        statuses = statuses_response.json()
    
    # Prepare result
    result = {
        'number': pr_data.get('number'),
        'state': pr_data.get('state'),
        'title': pr_data.get('title'),
        'html_url': pr_data.get('html_url'),
        'created_at': pr_data.get('created_at'),
        'updated_at': pr_data.get('updated_at'),
        'mergeable': mergeable,
        'mergeable_state': mergeable_state,
        'has_conflicts': mergeable == False,
        'reviews': {
            'total': len(reviews),
            'approved': sum(1 for r in reviews if r.get('state') == 'APPROVED'),
            'changes_requested': sum(1 for r in reviews if r.get('state') == 'CHANGES_REQUESTED'),
            'review_required': len(reviews) == 0
        },
        'status_checks': {
            'total': len(statuses),
            'success': sum(1 for s in statuses if s.get('state') == 'success'),
            'pending': sum(1 for s in statuses if s.get('state') == 'pending'),
            'failure': sum(1 for s in statuses if s.get('state') == 'failure')
        }
    }
    
    return result, 200

@app.route('/pr-status', methods=['POST'])
def get_pr_status():
    data = request.get_json()
    pr_urls = data.get('pr_urls', [])
    
    if not pr_urls:
        return jsonify({'error': 'No PR URLs provided'}), 400
    
    results = {}
    for url in pr_urls:
        # Parse PR URL to extract owner, repo, and PR number
        try:
            parts = url.strip('/').split('/')
            if 'github.com' in parts:
                github_index = parts.index('github.com')
                owner = parts[github_index + 1]
                repo = parts[github_index + 2]
                pr_number = int(parts[github_index + 4])
            else:
                # Handle case where URL might not contain github.com
                owner = parts[-4]
                repo = parts[-3]
                pr_number = int(parts[-1])
            
            status, code = get_pull_request_status(owner, repo, pr_number)
            
            if status:
                results[f"{owner}/{repo}#{pr_number}"] = {
                    'success': True,
                    'data': status
                }
            else:
                results[f"{owner}/{repo}#{pr_number}"] = {
                    'success': False,
                    'message': f'Failed to get PR status: {code}'
                }
        except (ValueError, IndexError):
            results[url] = {
                'success': False,
                'message': 'Invalid PR URL format'
            }
    
    return jsonify(results)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8081))
    app.run(host='0.0.0.0', port=port, debug=False) 