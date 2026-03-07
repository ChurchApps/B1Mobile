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

  static formatErrorMessage(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;
      if (typeof err.message === "string") return err.message;
      const raw = err.raw as Record<string, unknown> | undefined;
      if (typeof raw?.message === "string") return raw.message;
      if (typeof err.error === "string") return err.error;
    }
    return "An unexpected error occurred";
  }


  static showErrorAlert(error: unknown, title: string = "Error"): void {
    Alert.alert(title, this.formatErrorMessage(error));
  }

}
