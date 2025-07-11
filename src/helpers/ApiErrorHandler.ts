import { Alert } from "react-native";

export interface ApiResponse<T = any> {
  data?: T;
  raw?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
  success?: boolean;
}

export class ApiErrorHandler {
  static async handleApiCall<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options?: {
      successMessage?: string;
      errorTitle?: string;
      showSuccessAlert?: boolean;
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
      silentError?: boolean;
    }
  ): Promise<T | null> {
    try {
      const response = await apiCall();
      
      if (response?.raw?.message) {
        const errorMessage = response.raw.message;
        if (!options?.silentError) {
          Alert.alert(options?.errorTitle || "Error", errorMessage);
        }
        options?.onError?.(errorMessage);
        return null;
      }
      
      if (response?.data) {
        if (options?.showSuccessAlert && options?.successMessage) {
          Alert.alert("Success", options.successMessage);
        }
        options?.onSuccess?.(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      
      if (!options?.silentError) {
        Alert.alert(options?.errorTitle || "Error", errorMessage);
      }
      
      options?.onError?.(errorMessage);
      return null;
    }
  }

  static async handleApiCallWithLoading<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    setLoading: (loading: boolean) => void,
    options?: Parameters<typeof ApiErrorHandler.handleApiCall>[1]
  ): Promise<T | null> {
    setLoading(true);
    try {
      return await this.handleApiCall(apiCall, options);
    } finally {
      setLoading(false);
    }
  }

  static formatErrorMessage(error: any): string {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.raw?.message) return error.raw.message;
    if (error?.error) return error.error;
    return "An unexpected error occurred";
  }

  static isNetworkError(error: any): boolean {
    const message = this.formatErrorMessage(error).toLowerCase();
    return message.includes("network") || 
           message.includes("internet") || 
           message.includes("connection") ||
           message.includes("timeout");
  }

  static isAuthError(error: any): boolean {
    if (error?.raw?.statusCode === 401 || error?.raw?.statusCode === 403) return true;
    const message = this.formatErrorMessage(error).toLowerCase();
    return message.includes("unauthorized") || 
           message.includes("authentication") || 
           message.includes("permission");
  }

  static showErrorAlert(error: any, title: string = "Error"): void {
    Alert.alert(title, this.formatErrorMessage(error));
  }

  static async retry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }
}