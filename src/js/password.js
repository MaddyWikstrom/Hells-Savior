// Simple Password Protection
class PasswordProtection {
    constructor() {
        this.passwordScreen = document.getElementById('password-screen');
        this.mainContent = document.getElementById('main-content');
        this.passwordInput = document.getElementById('password-input');
        this.passwordSubmit = document.getElementById('password-submit');
        this.passwordError = document.getElementById('password-error');
        this.correctPassword = '4747';
        
        console.log('Elements found:', {
            passwordScreen: !!this.passwordScreen,
            mainContent: !!this.mainContent,
            passwordInput: !!this.passwordInput,
            passwordSubmit: !!this.passwordSubmit,
            passwordError: !!this.passwordError
        });
        
        this.init();
    }
    
    init() {
        // Hide main content initially
        if (this.mainContent) {
            this.mainContent.style.display = 'none';
        }
        
        // Add event listeners
        if (this.passwordSubmit) {
            this.passwordSubmit.addEventListener('click', () => {
                this.checkPassword();
            });
        }
        
        if (this.passwordInput) {
            this.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkPassword();
                }
            });
            
            // Clear error when user starts typing
            this.passwordInput.addEventListener('input', () => {
                this.hideError();
            });
            
            // Focus the input
            this.passwordInput.focus();
        }
    }
    
    checkPassword() {
        const enteredPassword = this.passwordInput.value;
        console.log('Checking password:', enteredPassword, 'Expected:', this.correctPassword);
        
        if (enteredPassword === this.correctPassword) {
            this.grantAccess();
        } else {
            this.showError();
        }
    }
    
    grantAccess() {
        console.log('Password correct - granting access');
        
        // Hide password screen
        if (this.passwordScreen) {
            console.log('Hiding password screen');
            this.passwordScreen.style.display = 'none';
        } else {
            console.log('Password screen element not found!');
        }
        
        // Show main content
        if (this.mainContent) {
            console.log('Showing main content');
            this.mainContent.classList.add('loaded');
        } else {
            console.log('Main content element not found!');
        }
    }
    
    showError() {
        console.log('Password incorrect');
        
        if (this.passwordError) {
            this.passwordError.style.display = 'block';
        }
        
        // Clear input
        if (this.passwordInput) {
            this.passwordInput.value = '';
            this.passwordInput.focus();
        }
        
        // Hide error after 3 seconds
        setTimeout(() => {
            this.hideError();
        }, 3000);
    }
    
    hideError() {
        if (this.passwordError) {
            this.passwordError.style.display = 'none';
        }
    }
}

// Initialize password protection when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing password protection');
    new PasswordProtection();
});