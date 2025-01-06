// lib/password-utils.ts

export interface PasswordStrength {
    isStrong: boolean;
    score: number;
    feedback: string[];
  }
  
  export function validatePassword(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;
  
    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 2;
    }
  
    // Contains number
    if (/\d/.test(password)) {
      score += 2;
    } else {
      feedback.push('Add numbers for stronger password');
    }
  
    // Contains lowercase
    if (/[a-z]/.test(password)) {
      score += 2;
    } else {
      feedback.push('Add lowercase letters for stronger password');
    }
  
    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      score += 2;
    } else {
      feedback.push('Add uppercase letters for stronger password');
    }
  
    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 2;
    } else {
      feedback.push('Add special characters for stronger password');
    }
  
    // Check for common patterns
    if (/^(12345|password|qwerty)/i.test(password)) {
      score -= 3;
      feedback.push('Avoid common password patterns');
    }
  
    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      score -= 2;
      feedback.push('Avoid repeated characters');
    }
  
    return {
      isStrong: score >= 6 && password.length >= 8,
      score: Math.max(0, Math.min(10, score)), // Normalize score between 0-10
      feedback,
    };
  }
  
  // Rate limit helper
  const attempts = new Map<string, { count: number; timestamp: number }>();
  
  export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 900000): boolean {
    const now = Date.now();
    const attempt = attempts.get(identifier);
  
    // Clean up old attempts
    if (attempt && now - attempt.timestamp > windowMs) {
      attempts.delete(identifier);
      return true;
    }
  
    if (!attempt) {
      attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }
  
    if (attempt.count >= maxAttempts) {
      return false;
    }
  
    attempt.count += 1;
    return true;
  }