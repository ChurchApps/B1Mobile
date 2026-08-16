import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { SecureStorageHelper } from "./SecureStorageHelper";

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock("@react-native-async-storage/async-storage", () => {
  const memory = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => memory.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => { memory.set(key, value); }),
      removeItem: jest.fn(async (key: string) => { memory.delete(key); }),
      multiRemove: jest.fn(async (keys: string[]) => { keys.forEach(key => memory.delete(key)); }),
      getAllKeys: jest.fn(async () => Array.from(memory.keys())),
      clear: jest.fn(async () => { memory.clear(); })
    }
  };
});

describe("SecureStorageHelper", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
    (SecureStore.setItemAsync as jest.Mock).mockReset().mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockReset().mockResolvedValue(null);
    (SecureStore.deleteItemAsync as jest.Mock).mockReset().mockResolvedValue(undefined);
  });

  it("stores tokens in SecureStore", async () => {
    await SecureStorageHelper.setSecureItem("default_jwt", "tok");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("default_jwt", "tok");
    expect(await AsyncStorage.getItem("secure_default_jwt")).toBeNull();
  });

  it("fails closed on native and does not write tokens to AsyncStorage", async () => {
    jest.spyOn(SecureStorageHelper, "insecureFallbackAllowed").mockReturnValue(false);
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error("unavailable"));
    await expect(SecureStorageHelper.setSecureItem("default_jwt", "tok")).rejects.toThrow("unavailable");
    expect(await AsyncStorage.getItem("secure_default_jwt")).toBeNull();
  });

  it("allows AsyncStorage fallback only for non-production web sessions", async () => {
    jest.spyOn(SecureStorageHelper, "insecureFallbackAllowed").mockReturnValue(true);
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error("unavailable"));
    await SecureStorageHelper.setSecureItem("default_jwt", "tok");
    expect(await AsyncStorage.getItem("secure_default_jwt")).toBe("tok");
  });

  it("does not read leftover AsyncStorage tokens when SecureStore fails on native", async () => {
    jest.spyOn(SecureStorageHelper, "insecureFallbackAllowed").mockReturnValue(false);
    await AsyncStorage.setItem("secure_default_jwt", "leftover");
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error("unavailable"));
    await expect(SecureStorageHelper.getSecureItem("default_jwt")).resolves.toBeNull();
  });

  it("migrates leftover AsyncStorage tokens into SecureStore then wipes them", async () => {
    jest.spyOn(SecureStorageHelper, "insecureFallbackAllowed").mockReturnValue(false);
    await AsyncStorage.setItem("secure_default_jwt", "leftover");
    await SecureStorageHelper.wipeInsecureFallbacks();
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("default_jwt", "leftover");
    expect(await AsyncStorage.getItem("secure_default_jwt")).toBeNull();
  });

  it("wipes leftover AsyncStorage tokens even if SecureStore migrate fails", async () => {
    jest.spyOn(SecureStorageHelper, "insecureFallbackAllowed").mockReturnValue(false);
    await AsyncStorage.setItem("secure_default_jwt", "leftover");
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error("unavailable"));
    await SecureStorageHelper.wipeInsecureFallbacks();
    expect(await AsyncStorage.getItem("secure_default_jwt")).toBeNull();
  });
});
