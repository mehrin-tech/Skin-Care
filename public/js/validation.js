document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input');

    const validators = {
        name: (val) => val.trim().length >= 2,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        password: (val) => val.length >= 6 && /\d/.test(val),
        confirmPassword: (val) => {
            const passwordInput = form.querySelector('input[name="password"]');
            return passwordInput && val === passwordInput.value;
        }
    };

    const errorMessages = {
        name: "Name must be at least 2 characters",
        email: "Must be a valid email format",
        password: "Minimum 6 characters and 1 number required",
        confirmPassword: "Passwords must match"
    };

    const validateInput = (input) => {
        const name = input.name;
        if (!validators[name]) return true;

        const isValid = validators[name](input.value);
        
        let errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains('client-error')) {
            errorEl.remove();
        }

        // Only show red border and error text if they've typed something
        if (input.value.length > 0) {
            if (!isValid) {
                input.classList.remove('border-slate-200', 'border-green-500', 'focus:border-[#14B8A6]');
                input.classList.add('border-red-500', 'focus:border-red-500');
                
                errorEl = document.createElement('p');
                errorEl.className = 'text-red-500 text-xs mt-1 client-error transition-all';
                errorEl.textContent = errorMessages[name];
                input.parentNode.insertBefore(errorEl, input.nextSibling);
            } else {
                input.classList.remove('border-slate-200', 'border-red-500', 'focus:border-red-500');
                input.classList.add('border-green-500', 'focus:border-green-500');
            }
        } else {
            input.classList.remove('border-red-500', 'border-green-500', 'focus:border-red-500', 'focus:border-green-500');
            input.classList.add('border-slate-200', 'focus:border-[#14B8A6]');
        }

        return isValid || input.value.length === 0;
    };

    const checkFormValidity = () => {
        let isFormValid = true;
        inputs.forEach(input => {
            if (validators[input.name] && !validators[input.name](input.value)) {
                isFormValid = false;
            }
            if (input.required && input.value.trim() === '') {
                 isFormValid = false;
            }
        });
        
        if (isFormValid) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    };

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            checkFormValidity();
        });
        
        input.addEventListener('blur', () => {
            validateInput(input);
            checkFormValidity();
        });
    });

    form.addEventListener('submit', (e) => {
        if (!submitBtn.disabled) {
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> Processing...
            `;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        }
    });

    checkFormValidity();
});
