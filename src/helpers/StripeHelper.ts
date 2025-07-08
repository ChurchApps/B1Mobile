/**
 * StripeHelper - Utility functions for Stripe integration
 * 
 * Note: This class now serves as a container for Stripe-related utilities.
 * Direct API calls have been replaced with Stripe React Native SDK usage.
 * Use @stripe/stripe-react-native hooks and components for new implementations.
 */
export class StripeHelper {
  
  /**
   * Formats a card number for display (masks all but last 4 digits)
   * @param cardNumber - The card number to format
   * @returns Formatted card number (e.g., "**** **** **** 1234")
   */
  static formatCardNumber(cardNumber: string): string {
    const lastFour = cardNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  }

  /**
   * Formats a bank account number for display (masks all but last 4 digits)
   * @param accountNumber - The account number to format
   * @returns Formatted account number (e.g., "****1234")
   */
  static formatAccountNumber(accountNumber: string): string {
    const lastFour = accountNumber.slice(-4);
    return `****${lastFour}`;
  }

  /**
   * Validates a routing number format
   * @param routingNumber - The routing number to validate
   * @returns True if valid, false otherwise
   */
  static validateRoutingNumber(routingNumber: string): boolean {
    return /^\d{9}$/.test(routingNumber);
  }

  /**
   * Validates an account number format
   * @param accountNumber - The account number to validate
   * @returns True if valid, false otherwise
   */
  static validateAccountNumber(accountNumber: string): boolean {
    return /^\d{4,17}$/.test(accountNumber);
  }
}
