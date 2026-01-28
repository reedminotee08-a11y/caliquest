// Password visibility toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId + 'Toggle');
    
    if (input && toggle) {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            toggle.textContent = 'visibility';
        }
    }
}

// Enhanced form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validatePasswordStrength(password) {
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { score, checks };
}

// Social login handlers
function handleGoogleLogin() {
    // Implementation for Google OAuth
    console.log('Google login initiated');
    window.caliQuestApp?.showNotification('جاري الاتصال بـ Google...', 'info');
}

function handleFacebookLogin() {
    // Implementation for Facebook OAuth
    console.log('Facebook login initiated');
    window.caliQuestApp?.showNotification('جاري الاتصال بـ Facebook...', 'info');
}

// Form submission helpers
function handleFormError(form, message) {
    if (window.caliQuestApp) {
        window.caliQuestApp.showNotification(message, 'error');
    }
    
    // Add error styling to form
    form.classList.add('border-red-500');
    setTimeout(() => {
        form.classList.remove('border-red-500');
    }, 3000);
}

function handleFormSuccess(form, message) {
    if (window.caliQuestApp) {
        window.caliQuestApp.showNotification(message, 'success');
    }
    
    // Add success styling to form
    form.classList.add('border-green-500');
    setTimeout(() => {
        form.classList.remove('border-green-500');
    }, 2000);
}

// Password requirements checker
function checkPasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    return requirements;
}

// Real-time validation feedback
function setupRealTimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type=\"email\"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validateEmail(input.value)) {
                input.classList.add('border-red-500');
                input.classList.remove('border-white/20');
            } else {
                input.classList.remove('border-red-500');
                input.classList.add('border-white/20');
            }
        });
    });
    
    // Username validation
    const usernameInputs = document.querySelectorAll('input[name=\"username\"]');
    usernameInputs.forEach(input => {
        input.addEventListener('input', () => {
            const isValid = validateUsername(input.value);
            if (input.value && !isValid) {
                input.classList.add('border-red-500');
                input.classList.remove('border-white/20');
            } else {
                input.classList.remove('border-red-500');
                input.classList.add('border-white/20');
            }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupRealTimeValidation();
    
    // Add keyboard navigation for auth modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('authModal');
            if (modal && !modal.classList.contains('hidden')) {
                window.caliQuestApp?.hideAuthModal();
            }
        }
    });
    
    // Add enter key submission for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                const submitBtn = form.querySelector('button[type=\"submit\"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        });
    });
});
