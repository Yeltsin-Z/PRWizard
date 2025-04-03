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
                    <div class="d-flex align-items-start justify-content-between">
                        <div class="d-flex">
                            <i class="bi ${result.success ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2" style="font-size: 1.15rem;"></i>
                            <div>
                                <h5>${repo}</h5>
                                <p class="mb-0 small">${result.message}</p>
                            </div>
                        </div>
                        ${result.url ? `<a href="${result.url}" target="_blank" class="pr-link ms-2">View PR</a>` : ''}
                    </div>
                `;
                
                resultItem.innerHTML = resultHTML;
                resultsContent.appendChild(resultItem);
                
                setTimeout(() => {
                    resultItem.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    resultItem.style.opacity = '1';
                    resultItem.style.transform = 'translateY(0)';
                }, 100 + (index * 150));
            });
            
            // Show results container for longer
            const resultsDiv = document.getElementById('results');
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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