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
 * Keyboard patterns to reject (common sequential patterns)
 */
const KEYBOARD_PATTERNS = [
  'qwerty', 'asdfgh', 'zxcvbnm', 'qwertyuiop',
  '123456', '654321', '1234567', '12345678', '123456789', '1234567890',
  '987654', '9876543', '98765432', '987654321',
];

/**
 * Check if password is sequential numbers or repeated characters
 */
const isSequentialOrRepeated = (password) => {
  // Check for repeated characters (111111, aaaaaa, etc.)
  if (/(.)\1{4,}/.test(password)) {
    return true;
  }

  // Check for sequential numbers
  for (let i = 0; i < password.length - 2; i++) {
    const char = password.charCodeAt(i);
    const next = password.charCodeAt(i + 1);
    const nextNext = password.charCodeAt(i + 2);

    // Check if sequential (ascending or descending)
    if ((next === char + 1 && nextNext === char + 2) ||
        (next === char - 1 && nextNext === char - 2)) {
      return true;
    }
  }

  return false;
};

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
      notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()) &&
                 !KEYBOARD_PATTERNS.some(pattern => password.toLowerCase().includes(pattern)) &&
                 !isSequentialOrRepeated(password),
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
    result.errors.push('This password is too weak or common. Please choose a stronger password');
  }

  // Determine if valid
  result.isValid = result.errors.length === 0;

  // Determine strength
  if (result.isValid) {
    const metRequirements = Object.values(result.requirements).filter(Boolean).length;
    if (metRequirements === 6) {
      result.strength = 'strong';
    } else if (metRequirements >= 5) {
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
