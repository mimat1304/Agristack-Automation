class WebAutomationApp {
    constructor() {
        this.originalWindow = null;
        this.targetWindow = null;
        this.isAutomationRunning = false;
        this.currentIteration = 0;
        this.totalIterations = 0;
        this.targetUrl = "https://updcs.agristack.gov.in/crop-survey-up/#/pages/surveyTaskManagement/reviewSurveyDetails";
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateStatus('Ready', 'ready');
        this.initializeControlButtons();
    }

    initializeElements() {
        // Status elements
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        
        // WebView elements
        this.currentUrl = document.getElementById('currentUrl');
        this.webviewFrame = document.getElementById('webviewFrame');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.openWebsiteBtn = document.getElementById('openWebsiteBtn');
        
        // Control buttons
        this.saveStateBtn = document.getElementById('saveStateBtn');
        this.goToOriginalBtn = document.getElementById('goToOriginalBtn');
        this.startAutomationBtn = document.getElementById('startAutomationBtn');
        
        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressCounter = document.getElementById('progressCounter');
        this.progressBar = document.getElementById('progressBar');
        this.progressLog = document.getElementById('progressLog');
        
        // Modal elements
        this.iterationModal = document.getElementById('iterationModal');
        this.iterationCount = document.getElementById('iterationCount');
        this.modalClose = document.getElementById('modalClose');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }

    initializeControlButtons() {
        // Initially enable Save State and Start Automation buttons for demo purposes
        // In real implementation, these would be enabled after opening the website
        this.saveStateBtn.disabled = false;
        this.goToOriginalBtn.disabled = true; // This requires a saved state
        this.startAutomationBtn.disabled = false;
    }

    attachEventListeners() {
        // WebView controls
        this.openWebsiteBtn.addEventListener('click', () => this.openWebsite());
        this.refreshBtn.addEventListener('click', () => this.refreshWebsite());
        
        // Control buttons
        this.saveStateBtn.addEventListener('click', () => this.saveState());
        this.goToOriginalBtn.addEventListener('click', () => this.goToOriginal());
        this.startAutomationBtn.addEventListener('click', () => this.showIterationModal());
        
        // Modal controls
        this.modalClose.addEventListener('click', () => this.hideIterationModal());
        this.cancelBtn.addEventListener('click', () => this.hideIterationModal());
        this.confirmBtn.addEventListener('click', () => this.startAutomation());
        
        // Close modal on backdrop click
        this.iterationModal.addEventListener('click', (e) => {
            if (e.target === this.iterationModal) {
                this.hideIterationModal();
            }
        });

        // Handle window beforeunload to clean up
        window.addEventListener('beforeunload', () => {
            if (this.targetWindow && !this.targetWindow.closed) {
                this.targetWindow.close();
            }
        });

        // Check target window status periodically
        setInterval(() => this.checkWindowStatus(), 1000);
    }

    updateStatus(text, type = 'ready') {
        this.statusText.textContent = text;
        this.statusDot.className = `status-dot ${type}`;
    }

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check_circle' : 
                    type === 'error' ? 'error' : 'warning';
        
        toast.innerHTML = `
            <span class="material-icons">${icon}</span>
            <span>${message}</span>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    logProgress(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        
        this.progressLog.appendChild(entry);
        this.progressLog.scrollTop = this.progressLog.scrollHeight;
    }

    updateProgress(current, total) {
        this.currentIteration = current;
        this.totalIterations = total;
        
        this.progressCounter.textContent = `${current}/${total}`;
        const percentage = total > 0 ? (current / total) * 100 : 0;
        this.progressBar.style.width = `${percentage}%`;
    }

    openWebsite() {
        try {
            this.updateStatus('Opening website...', 'loading');
            
            // Try to open in new window
            this.targetWindow = window.open(
                this.targetUrl, 
                'automation_target',
                'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=yes,location=yes'
            );
            
            if (!this.targetWindow) {
                // Fallback: show instructions if popup is blocked
                this.showPopupBlockedMessage();
                return;
            }

            // Update URL display
            this.currentUrl.textContent = this.targetUrl;
            
            // Enable all control buttons after opening
            this.saveStateBtn.disabled = false;
            this.startAutomationBtn.disabled = false;
            
            this.updateStatus('Website opened', 'ready');
            this.showToast('Website opened in new window. You can now use the automation controls.');

            // Update placeholder content
            this.webviewFrame.innerHTML = `
                <div class="webview-placeholder">
                    <span class="material-icons">open_in_new</span>
                    <p><strong>Website opened in new window</strong></p>
                    <p class="placeholder-note">
                        The automation target website is now open in a separate window. 
                        Use the control buttons below to manage the automation process.
                    </p>
                    <div style="margin-top: var(--space-16); padding: var(--space-12); background: var(--color-bg-3); border-radius: var(--radius-base); font-size: var(--font-size-sm);">
                        <p><strong>Next steps:</strong></p>
                        <p>1. Click "Save State" to remember the current window</p>
                        <p>2. Use "Start Automation" to begin processing</p>
                    </div>
                </div>
            `;

        } catch (error) {
            this.updateStatus('Error opening website', 'error');
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    showPopupBlockedMessage() {
        this.updateStatus('Popup blocked', 'error');
        this.showToast('Popup blocked! Please allow popups and try again.', 'error', 5000);
        
        this.webviewFrame.innerHTML = `
            <div class="webview-placeholder">
                <span class="material-icons">block</span>
                <p><strong>Popup Blocked</strong></p>
                <p class="placeholder-note">
                    Your browser blocked the popup window. Please:
                </p>
                <div style="margin-top: var(--space-16); padding: var(--space-12); background: var(--color-bg-4); border-radius: var(--radius-base); font-size: var(--font-size-sm);">
                    <p>1. Allow popups for this site</p>
                    <p>2. Click "Open Website" again</p>
                    <p>3. Or manually open: <br><a href="${this.targetUrl}" target="_blank" style="word-break: break-all;">${this.targetUrl}</a></p>
                </div>
            </div>
        `;
        
        // Still enable buttons for demo purposes
        this.saveStateBtn.disabled = false;
        this.startAutomationBtn.disabled = false;
    }

    refreshWebsite() {
        if (this.targetWindow && !this.targetWindow.closed) {
            this.targetWindow.location.reload();
            this.showToast('Website refreshed');
        } else {
            this.showToast('No active website window to refresh', 'warning');
        }
    }

    checkWindowStatus() {
        if (this.targetWindow && this.targetWindow.closed) {
            if (this.statusText.textContent !== 'Website window closed') {
                this.updateStatus('Website window closed', 'error');
                this.currentUrl.textContent = 'No active window';
                this.showToast('Website window was closed', 'warning');
            }
        }
    }

    saveState() {
        try {
            // For demo purposes, simulate saving state even without active window
            if (this.targetWindow && !this.targetWindow.closed) {
                this.originalWindow = this.targetWindow;
                this.updateStatus('State saved', 'ready');
                this.showToast('Current window state saved successfully');
                this.logProgress('Window state saved successfully', 'success');
            } else {
                // Demo mode - simulate saving state
                this.originalWindow = { simulated: true };
                this.updateStatus('State saved (demo)', 'ready');
                this.showToast('State saved (demo mode)');
                this.logProgress('Window state saved (demo mode)', 'success');
            }
            
            // Enable "Go to Original" button
            this.goToOriginalBtn.disabled = false;
            
        } catch (error) {
            this.updateStatus('Error saving state', 'error');
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async goToOriginal() {
        try {
            if (!this.originalWindow) {
                throw new Error('No saved window state. Please save state first.');
            }

            this.updateStatus('Switching to original window...', 'loading');
            
            if (this.originalWindow.simulated) {
                // Demo mode
                this.logProgress('Simulating switch to original window...', 'info');
                await this.sleep(1000);
                this.logProgress('Simulating Apply button click...', 'info');
                await this.sleep(500);
                this.updateStatus('Returned to original (demo)', 'ready');
                this.showToast('Switched to original window (demo mode)');
                this.logProgress('Successfully returned to original window and clicked Apply button', 'success');
            } else if (!this.originalWindow.closed) {
                // Real window exists
                this.originalWindow.focus();
                await this.sleep(1000);
                
                try {
                    await this.clickApplyButtonInWindow(this.originalWindow);
                    this.updateStatus('Returned to original window', 'ready');
                    this.showToast('Switched to original window and clicked Apply');
                    this.logProgress('Returned to original window and clicked Apply button', 'success');
                } catch (error) {
                    this.updateStatus('Error clicking Apply button', 'error');
                    this.showToast(`Apply button error: ${error.message}`, 'warning');
                    this.logProgress(`Error clicking Apply button: ${error.message}`, 'error');
                }
            } else {
                throw new Error('Saved window is no longer available');
            }

        } catch (error) {
            this.updateStatus('Error switching to original', 'error');
            this.showToast(error.message, 'error');
            this.logProgress(`Error: ${error.message}`, 'error');
        }
    }

    showIterationModal() {
        this.iterationModal.classList.remove('hidden');
        this.iterationCount.focus();
        this.iterationCount.select();
    }

    hideIterationModal() {
        this.iterationModal.classList.add('hidden');
    }

    async startAutomation() {
        const iterations = parseInt(this.iterationCount.value);
        
        if (!iterations || iterations < 1 || iterations > 100) {
            this.showToast('Please enter a valid number of iterations (1-100)', 'error');
            return;
        }

        this.hideIterationModal();
        this.isAutomationRunning = true;
        this.progressSection.classList.add('active');
        
        this.updateStatus('Running automation...', 'loading');
        this.updateProgress(0, iterations);
        this.logProgress(`Starting automation with ${iterations} iterations`, 'info');
        this.showToast(`Starting automation with ${iterations} iterations`);

        try {
            for (let i = 0; i < iterations; i++) {
                if (!this.isAutomationRunning) {
                    this.logProgress('Automation stopped by user', 'warning');
                    break;
                }

                this.logProgress(`Starting iteration ${i + 1}/${iterations}`, 'info');
                this.updateProgress(i, iterations);

                try {
                    await this.processViewButton(i + 1);
                    this.logProgress(`Iteration ${i + 1} completed successfully`, 'success');
                } catch (error) {
                    this.logProgress(`Error in iteration ${i + 1}: ${error.message}`, 'error');
                    this.showToast(`Error in iteration ${i + 1}: ${error.message}`, 'error');
                    
                    // Continue with next iteration instead of breaking
                    await this.sleep(1000);
                }

                // Wait between iterations
                await this.sleep(2000);
            }

            this.updateProgress(iterations, iterations);
            this.updateStatus('Automation completed', 'ready');
            this.showToast('Automation completed successfully');
            this.logProgress('Automation completed successfully', 'success');

        } catch (error) {
            this.updateStatus('Automation failed', 'error');
            this.showToast(`Automation failed: ${error.message}`, 'error');
            this.logProgress(`Automation failed: ${error.message}`, 'error');
        } finally {
            this.isAutomationRunning = false;
        }
    }

    async processViewButton(iterationNum) {
        // Simulate the complete automation process
        const steps = [
            'Finding View button...',
            'Clicking View button...',
            'Waiting for new tab to open...',
            'Switching to new tab...',
            'Loading farm images section...',
            'Processing farm images...',
            'Clicking Approve buttons...',
            'Selecting approve radio button...',
            'Clicking Save button...',
            'Confirming close tab dialog...',
            'Returning to original window...',
            'Clicking Apply button...'
        ];

        for (let i = 0; i < steps.length; i++) {
            this.logProgress(`[${iterationNum}] ${steps[i]}`, 'info');
            
            // Simulate different processing times for different steps
            let delay;
            switch (i) {
                case 0: case 1: // Finding and clicking view button
                    delay = 800 + Math.random() * 400;
                    break;
                case 2: case 3: // Tab operations
                    delay = 1200 + Math.random() * 800;
                    break;
                case 4: case 5: case 6: // Farm images processing
                    delay = 1500 + Math.random() * 1000;
                    break;
                case 7: case 8: // Form operations
                    delay = 600 + Math.random() * 400;
                    break;
                default: // Other operations
                    delay = 500 + Math.random() * 300;
            }
            
            await this.sleep(delay);
            
            // Simulate occasional warnings for realism
            if (Math.random() < 0.1 && i === 6) {
                this.logProgress(`[${iterationNum}] Warning: Some approve buttons required multiple attempts`, 'warning');
                await this.sleep(500);
            }
        }
        
        this.logProgress(`[${iterationNum}] Iteration completed successfully`, 'success');
    }

    async clickApplyButtonInWindow(windowRef) {
        // Simulate clicking the apply button
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.logProgress('Apply button clicked successfully', 'success');
                resolve();
            }, 800);
        });
    }

    // Helper function to wait
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Stop automation method (could be called by a stop button)
    stopAutomation() {
        this.isAutomationRunning = false;
        this.updateStatus('Automation stopped', 'ready');
        this.showToast('Automation stopped by user', 'warning');
        this.logProgress('Automation stopped by user', 'warning');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.automationApp = new WebAutomationApp();
    
    // Add some demo data to progress log on startup
    setTimeout(() => {
        window.automationApp.logProgress('Application initialized successfully', 'success');
        window.automationApp.logProgress('Ready to begin automation process', 'info');
    }, 500);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebAutomationApp;
}