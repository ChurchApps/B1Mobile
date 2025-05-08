declare module 'expo-error-recovery' {
  export function setGlobalErrorHandler(handler: (error: Error, isFatal?: boolean) => void): void;
  export function getGlobalErrorHandler(): ((error: Error, isFatal?: boolean) => void) | null;
} 