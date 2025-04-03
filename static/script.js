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
            card.style.transform = 'translateY(20px)';
            card.style.transition = `all 0.5s ease ${index * 0.15}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        });
    }, 300);
    
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
        resultsDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        resultsDiv.offsetHeight;
        
        resultsDiv.style.opacity = '1';
        resultsDiv.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
    }
    
    function displayResults(data) {
        resultsContent.innerHTML = '';
        
        spinner.style.opacity = '0';
        spinner.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            spinner.style.display = 'none';
            spinner.style.opacity = '1';
            
            Object.keys(data).forEach((repo, index) => {
                const result = data[repo];
                const resultItem = document.createElement('div');
                resultItem.className = `result-item ${result.success ? 'result-success' : 'result-error'}`;
                
                resultItem.style.opacity = '0';
                resultItem.style.transform = 'translateY(15px)';
                
                let resultHTML = `
                    <div class="d-flex align-items-start">
                        <i class="bi ${result.success ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2" style="font-size: 1.25rem;"></i>
                        <div>
                            <h5>${repo}</h5>
                            <p>${result.message}</p>
                            ${result.url ? `<a href="${result.url}" target="_blank" class="pr-link">View Pull Request</a>` : ''}
                        </div>
                    </div>
                `;
                
                resultItem.innerHTML = resultHTML;
                resultsContent.appendChild(resultItem);
                
                setTimeout(() => {
                    resultItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    resultItem.style.opacity = '1';
                    resultItem.style.transform = 'translateY(0)';
                }, 100 + (index * 150));
            });
        }, 300);
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
        
        resultsContent.innerHTML = '';
        spinner.style.display = 'block';
        
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
                successMessage.style.borderRadius = '8px';
                successMessage.style.display = 'flex';
                successMessage.style.alignItems = 'center';
                successMessage.style.padding = '1rem 1.5rem';
                successMessage.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>All PRs created successfully!';
                
                notificationContainer.appendChild(successMessage);
                document.body.appendChild(notificationContainer);
                
                notificationContainer.offsetHeight;
                
                notificationContainer.style.transform = 'translateX(-50%) translateY(0)';
                
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
                errorItem.style.transition = 'all 0.4s ease';
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
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        
        @keyframes pulseLight {
            0%, 100% { box-shadow: 0 0 0 rgba(0, 0, 0, 0); }
            50% { box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        }
        
        .is-invalid {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
        }
        
        .alert {
            animation: pulseLight 2s infinite;
        }
    `;
    document.head.appendChild(styleSheet);
    
    preprodBtn.addEventListener('click', () => createPRs('preprod', preprodBtn));
    prodBtn.addEventListener('click', () => createPRs('prod', prodBtn));
}); 