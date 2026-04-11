/**
 * Common weak passwords to reject
 */
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'sunshine', 'shadow', 'princess', 'qazwsx',
  '123456', 'password1', 'pass123', 'test123', 'user123',
  'barangay', 'police', 'tanod', 'admin123', 'test',
];

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with details
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'weak', // weak, fair, good, strong
    errors: [],
    requirements: {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    },
  };

  // Check minimum length
  if (!result.requirements.minLength) {
    result.errors.push('Password must be at least 8 characters');
  }

  // Check uppercase
  if (!result.requirements.hasUpperCase) {
    result.errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check lowercase
  if (!result.requirements.hasLowerCase) {
    result.errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check number
  if (!result.requirements.hasNumber) {
    result.errors.push('Password must contain at least one number (0-9)');
  }

  // Check symbol
  if (!result.requirements.hasSymbol) {
    result.errors.push('Password must contain at least one symbol (!@#$%^&*)');
  }

  // Check common passwords
  if (!result.requirements.notCommon) {
    result.errors.push('This password is too common. Please choose a stronger password');
  }

  // Determine if valid
  result.isValid = result.errors.length === 0;

  // Determine strength
  if (result.isValid) {
    const metRequirements = Object.values(result.requirements).filter(Boolean).length;
    if (metRequirements === 5) {
      result.strength = 'strong';
    } else if (metRequirements >= 4) {
      result.strength = 'good';
    } else {
      result.strength = 'fair';
    }
  }

  return result;
};

/**
 * Get password strength color (for UI)
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'strong':
      return 'success';
    case 'good':
      return 'info';
    case 'fair':
      return 'warning';
    case 'weak':
    default:
      return 'error';
  }
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength) => {
  switch (strength) {
    case 'strong':
      return 'Strong';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'weak':
    default:
      return 'Weak';
  }
};
