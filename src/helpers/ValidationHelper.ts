export class ValidationHelper {
  static email(value: string): string | null {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Invalid email address";
    return null;
  }

  static phone(value: string): string | null {
    if (!value) return "Phone number is required";
    const phoneRegex = /^\+?[\d\s-()]+$/;
    const digits = value.replace(/\D/g, "");
    if (!phoneRegex.test(value) || digits.length < 10) return "Invalid phone number";
    return null;
  }

  static required(value: any, fieldName: string = "This field"): string | null {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  }

  static minLength(value: string, min: number, fieldName: string = "This field"): string | null {
    if (!value || value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  }

  static maxLength(value: string, max: number, fieldName: string = "This field"): string | null {
    if (value && value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  }

  static password(value: string): string | null {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  static confirmPassword(password: string, confirmPassword: string): string | null {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  }

  static number(value: string, fieldName: string = "This field"): string | null {
    if (!value) return `${fieldName} is required`;
    if (isNaN(Number(value))) return `${fieldName} must be a number`;
    return null;
  }

  static positiveNumber(value: string, fieldName: string = "This field"): string | null {
    const numberError = this.number(value, fieldName);
    if (numberError) return numberError;
    if (Number(value) <= 0) return `${fieldName} must be greater than 0`;
    return null;
  }

  static url(value: string): string | null {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "Invalid URL";
    }
  }

  static zipCode(value: string): string | null {
    if (!value) return "ZIP code is required";
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(value)) return "Invalid ZIP code";
    return null;
  }

  static creditCard(value: string): string | null {
    if (!value) return "Credit card number is required";
    const cleaned = value.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(cleaned)) return "Invalid credit card number";
    return null;
  }

  static cvv(value: string): string | null {
    if (!value) return "CVV is required";
    if (!/^\d{3,4}$/.test(value)) return "Invalid CVV";
    return null;
  }

  static expiryDate(value: string): string | null {
    if (!value) return "Expiry date is required";
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(value)) return "Invalid expiry date (MM/YY)";

    const [month, year] = value.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (Number(year) < currentYear || (Number(year) === currentYear && Number(month) < currentMonth)) {
      return "Card has expired";
    }

    return null;
  }

  static validateForm(values: Record<string, any>, validators: Record<string, (value: any) => string | null>): Record<string, string> {
    const errors: Record<string, string> = {};

    Object.keys(validators).forEach(key => {
      const error = validators[key](values[key]);
      if (error) {
        errors[key] = error;
      }
    });

    return errors;
  }

  static hasErrors(errors: Record<string, string>): boolean {
    return Object.keys(errors).length > 0;
  }
}
