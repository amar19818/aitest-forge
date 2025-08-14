export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common patterns that should be avoided');
    score -= 1;
  }

  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., aaa, 111)');
    score -= 1;
  }

  // Sequential characters check
  const hasSequential = () => {
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789'];
    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 3; i++) {
        if (password.toLowerCase().includes(seq.substring(i, i + 3))) {
          return true;
        }
      }
    }
    return false;
  };

  if (hasSequential()) {
    errors.push('Password should not contain sequential characters (e.g., abc, 123)');
    score -= 1;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score >= 5 && errors.length === 0) {
    strength = 'strong';
  } else if (score >= 3 && errors.length <= 1) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, Math.min(6, score))
  };
};

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak':
      return 'text-destructive';
    case 'medium':
      return 'text-warning';
    case 'strong':
      return 'text-success';
    default:
      return 'text-muted-foreground';
  }
};

export const getPasswordStrengthProgress = (score: number): number => {
  return (score / 6) * 100;
};