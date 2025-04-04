document.addEventListener('DOMContentLoaded', function() {
    const preprodBtn = document.getElementById('preprodBtn');
    const prodBtn = document.getElementById('prodBtn');
    const prTitleInput = document.getElementById('prTitle');
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    const spinner = document.getElementById('spinner');
    
    setTimeout(() => {
        document.querySelectorAll('.card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        });
    }, 300);
    
    setTimeout(() => {
        document.querySelectorAll('.badge').forEach((badge, index) => {
            badge.style.opacity = '0';
            badge.style.transform = 'scale(0.8)';
            badge.style.transition = `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.6 + (index * 0.1)}s`;
            
            setTimeout(() => {
                badge.style.opacity = '1';
                badge.style.transform = 'scale(1)';
            }, 100);
        });
    }, 400);
    
    function validateTitle() {
        const title = prTitleInput.value.trim();
        if (!title) {
            prTitleInput.classList.add('is-invalid');
            prTitleInput.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
            
            setTimeout(() => {
                prTitleInput.style.animation = '';
            }, 500);
            
            return false;
        }
        
        prTitleInput.classList.remove('is-invalid');
        return true;
    }
    
    prTitleInput.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
    
    function showResultsContainer() {
        resultsDiv.style.display = 'block';
        resultsDiv.style.opacity = '0';
        resultsDiv.style.transform = 'translateY(20px)';
        resultsDiv.style.transition = 'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        resultsDiv.offsetHeight;
        
        resultsDiv.style.opacity = '1';
        resultsDiv.style.transform = 'translateY(0)';
        
        // Reset and show spinner
        spinner.style.display = 'block';
        spinner.style.opacity = '1';
        resultsContent.innerHTML = '';
        
        setTimeout(() => {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
    }
    
    // Global variable to store the PR URLs for status tracking
    let createdPRs = [];

    function displayResults(data) {
        // Fade out spinner gradually
        spinner.style.transition = 'opacity 0.4s ease';
        spinner.style.opacity = '0';
        
        // Reset global PR URLs
        createdPRs = [];
        
        setTimeout(() => {
            spinner.style.display = 'none';
            
            // Clear previous results
            resultsContent.innerHTML = '';
            
            // Create refresh button
            const refreshRow = document.createElement('div');
            refreshRow.className = 'refresh-row mb-3';
            refreshRow.innerHTML = `
                <button class="btn btn-sm btn-outline-primary" id="refreshStatusBtn">
                    <i class="bi bi-arrow-clockwise me-1"></i>Refresh Status
                </button>
            `;
            resultsContent.appendChild(refreshRow);
            
            // Add event listener to refresh button
            document.getElementById('refreshStatusBtn').addEventListener('click', fetchPRStatus);
            
            // Add repositories in alphabetical order for consistency
            const repos = Object.keys(data).sort();
            repos.forEach((repo, index) => {
                const result = data[repo];
                const resultItem = document.createElement('div');
                resultItem.className = `result-item ${result.success ? 'result-success' : 'result-error'}`;
                resultItem.setAttribute('data-repo', repo);
                resultItem.style.setProperty('--item-index', index);
                
                resultItem.style.opacity = '0';
                resultItem.style.transform = 'translateY(15px)';
                
                // Store PR URL for status checking
                if (result.success && result.url) {
                    createdPRs.push(result.url);
                }
                
                let resultHTML = `
                    <div class="d-flex align-items-center">
                        <i class="bi ${result.success ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2" style="font-size: 1.15rem;"></i>
                        <div>
                            <h5 class="mb-0 fw-bold">${repo}</h5>
                            <p class="mb-0 small">${result.message}</p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        ${result.url ? 
                            `<a href="${result.url}" target="_blank" class="pr-link">View PR</a>
                            <div class="pr-status ms-2" data-pr-url="${result.url}">
                                <span class="badge bg-secondary"><i class="bi bi-hourglass-split me-1"></i>Loading...</span>
                            </div>` 
                            : ''
                        }
                    </div>
                `;
                
                resultItem.innerHTML = resultHTML;
                resultsContent.appendChild(resultItem);
                
                setTimeout(() => {
                    resultItem.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    resultItem.style.opacity = '1';
                    resultItem.style.transform = 'translateY(0)';
                }, 100 + (index * 120));
            });
            
            // Ensure results container stays visible
            resultsDiv.style.display = 'block';
            
            // After a short delay, fetch PR statuses
            if (createdPRs.length > 0) {
                setTimeout(fetchPRStatus, 1500);
            }
        }, 400);
    }
    
    function fetchPRStatus() {
        if (createdPRs.length === 0) return;
        
        // Update all PR status indicators to "loading"
        document.querySelectorAll('.pr-status').forEach(statusElement => {
            statusElement.innerHTML = `<span class="badge bg-secondary"><i class="bi bi-hourglass-split me-1"></i>Loading...</span>`;
        });
        
        fetch('/pr-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pr_urls: createdPRs
            })
        })
        .then(response => response.json())
        .then(data => {
            updatePRStatus(data);
        })
        .catch(error => {
            console.error('Error fetching PR status:', error);
        });
    }
    
    function updatePRStatus(statusData) {
        Object.keys(statusData).forEach(prKey => {
            const prResult = statusData[prKey];
            if (!prResult.success) return;
            
            const prData = prResult.data;
            const prUrl = prData.html_url;
            
            // Find the status element for this PR
            const statusElement = document.querySelector(`.pr-status[data-pr-url="${prUrl}"]`);
            if (!statusElement) return;
            
            // Update the status display
            let statusHTML = '';
            
            // Check for merge conflicts
            if (prData.has_conflicts) {
                statusHTML += `<span class="badge bg-danger ms-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Conflicts</span>`;
            }
            
            // Check reviews status
            if (prData.reviews.approved > 0) {
                statusHTML += `<span class="badge bg-success ms-1"><i class="bi bi-check-circle-fill me-1"></i>Approved (${prData.reviews.approved})</span>`;
            } else if (prData.reviews.changes_requested > 0) {
                statusHTML += `<span class="badge bg-warning text-dark ms-1"><i class="bi bi-pencil-fill me-1"></i>Changes Requested</span>`;
            } else if (prData.reviews.review_required) {
                statusHTML += `<span class="badge bg-secondary ms-1"><i class="bi bi-eye me-1"></i>Review Needed</span>`;
            }
            
            // Check CI status
            if (prData.status_checks.total > 0) {
                if (prData.status_checks.failure > 0) {
                    statusHTML += `<span class="badge bg-danger ms-1"><i class="bi bi-x-circle-fill me-1"></i>CI Failed</span>`;
                } else if (prData.status_checks.pending > 0) {
                    statusHTML += `<span class="badge bg-info text-white ms-1"><i class="bi bi-hourglass-split me-1"></i>CI Running</span>`;
                } else if (prData.status_checks.success === prData.status_checks.total) {
                    statusHTML += `<span class="badge bg-success ms-1"><i class="bi bi-check-circle-fill me-1"></i>CI Passed</span>`;
                }
            }
            
            // If no status badges were added, show a default "Open" badge
            if (statusHTML === '') {
                statusHTML = `<span class="badge bg-primary ms-1"><i class="bi bi-git-pull-request me-1"></i>Open</span>`;
            }
            
            statusElement.innerHTML = statusHTML;
        });
    }
    
    async function createPRs(type, button) {
        if (!validateTitle()) return;
        
        const title = prTitleInput.value.trim();
        
        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;
        button.style.width = `${originalWidth}px`;
        button.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
        button.disabled = true;
        
        button.style.opacity = '0.8';
        setTimeout(() => {
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...`;
            button.style.opacity = '1';
        }, 200);
        
        // Show results container with spinner
        showResultsContainer();
        
        try {
            const response = await fetch('/create-prs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    type: type
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create PRs');
            }
            
            setTimeout(() => {
                displayResults(data);
                
                const notificationContainer = document.createElement('div');
                notificationContainer.style.position = 'fixed';
                notificationContainer.style.top = '0';
                notificationContainer.style.left = '50%';
                notificationContainer.style.transform = 'translateX(-50%) translateY(-100%)';
                notificationContainer.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                notificationContainer.style.zIndex = '1050';
                notificationContainer.style.width = 'auto';
                
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success shadow';
                successMessage.style.margin = '1rem';
                successMessage.style.borderRadius = '12px';
                successMessage.style.display = 'flex';
                successMessage.style.alignItems = 'center';
                successMessage.style.padding = '1rem 1.5rem';
                successMessage.style.opacity = '0.95';
                successMessage.style.transform = 'scale(0.95)';
                successMessage.style.transition = 'all 0.3s ease';
                successMessage.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>All PRs created successfully!';
                
                notificationContainer.appendChild(successMessage);
                document.body.appendChild(notificationContainer);
                
                notificationContainer.offsetHeight;
                
                notificationContainer.style.transform = 'translateX(-50%) translateY(0)';
                
                successMessage.addEventListener('mouseenter', () => {
                    successMessage.style.opacity = '1';
                    successMessage.style.transform = 'scale(1)';
                });
                
                successMessage.addEventListener('mouseleave', () => {
                    successMessage.style.opacity = '0.95';
                    successMessage.style.transform = 'scale(0.95)';
                });
                
                setTimeout(() => {
                    notificationContainer.style.transform = 'translateX(-50%) translateY(-100%)';
                    setTimeout(() => {
                        notificationContainer.remove();
                    }, 500);
                }, 4000);
            }, 600);
            
        } catch (error) {
            spinner.style.display = 'none';
            
            const errorItem = document.createElement('div');
            errorItem.className = 'result-item result-error';
            errorItem.style.opacity = '0';
            errorItem.style.transform = 'translateY(10px)';
            errorItem.innerHTML = `
                <div class="d-flex align-items-start">
                    <i class="bi bi-exclamation-triangle-fill text-danger me-2" style="font-size: 1.25rem;"></i>
                    <div>
                        <p>Error: ${error.message}</p>
                    </div>
                </div>
            `;
            
            resultsContent.appendChild(errorItem);
            
            setTimeout(() => {
                errorItem.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                errorItem.style.opacity = '1';
                errorItem.style.transform = 'translateY(0)';
            }, 100);
        } finally {
            setTimeout(() => {
                button.style.opacity = '0.8';
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.disabled = false;
                    button.style.opacity = '1';
                    setTimeout(() => {
                        button.style.width = 'auto';
                    }, 300);
                }, 200);
            }, 1000);
        }
    }
    
    function addButtonEffects(button) {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            button.style.boxShadow = '0 7px 14px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
        
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-3px)';
        });
    }
    
    addButtonEffects(preprodBtn);
    addButtonEffects(prodBtn);
    
    document.querySelectorAll('.branch').forEach(branch => {
        setInterval(() => {
            branch.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            branch.style.boxShadow = '0 5px 15px rgba(99, 102, 241, 0.2)';
            
            setTimeout(() => {
                branch.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
            }, 1500);
        }, 3000);
    });
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    preprodBtn.addEventListener('click', () => createPRs('preprod', preprodBtn));
    prodBtn.addEventListener('click', () => createPRs('prod', prodBtn));
    
    prTitleInput.addEventListener('focus', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.style.transform = 'scale(1.01)';
        this.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
    });
    
    prTitleInput.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
    });
}); 