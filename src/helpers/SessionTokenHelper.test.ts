import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiHelper } from "@churchapps/helpers";
import { LoginUserChurchInterface, UserInterface } from "./Interfaces";
import { SecureStorageHelper } from "./SecureStorageHelper";
import { SessionTokenHelper } from "./SessionTokenHelper";

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));
jest.mock("@churchapps/helpers", () => ({
  ApiHelper: { setDefaultPermissions: jest.fn(), setPermissions: jest.fn() }
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

const church: LoginUserChurchInterface = {
  person: { id: "p1", name: { display: "Ada" } } as any,
  church: { id: "ch1", name: "First Church" },
  jwt: "church.jwt.token",
  apis: [
    { name: "Membership", keyName: "MembershipApi", jwt: "membership.jwt", permissions: [] },
    { name: "Content", keyName: "ContentApi", jwt: "content.jwt", permissions: [] }
  ],
  groups: [{ id: "g1", name: "Choir", tags: "team" }]
};

const user: UserInterface = { id: "u1", email: "ada@example.com", firstName: "Ada", jwt: "user.jwt.token" };

describe("SessionTokenHelper", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.spyOn(SecureStorageHelper, "insecureFallbackAllowed").mockReturnValue(false);
    jest.spyOn(SecureStorageHelper, "setSecureItem").mockResolvedValue(undefined);
    jest.spyOn(SecureStorageHelper, "getSecureItem").mockResolvedValue(null);
    jest.spyOn(SecureStorageHelper, "removeSecureItem").mockResolvedValue(undefined);
    jest.spyOn(SecureStorageHelper, "wipeInsecureFallbacks").mockResolvedValue(undefined);
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("strips church and user JWTs from persist payloads", () => {
    const strippedChurch = SessionTokenHelper.stripChurchSecrets(church);
    expect(strippedChurch?.jwt).toBe("");
    expect(strippedChurch?.apis.every(api => api.jwt === "")).toBe(true);
    expect(strippedChurch?.church.id).toBe("ch1");
    expect(strippedChurch?.person).toEqual(church.person);
    expect(JSON.stringify(strippedChurch)).not.toMatch(/jwt":"[^"]+"/);

    const strippedUser = SessionTokenHelper.stripUserSecrets(user);
    expect(strippedUser?.jwt).toBeUndefined();
    expect(strippedUser?.email).toBe("ada@example.com");
    expect(JSON.stringify(strippedUser)).not.toContain("jwt");
  });

  it("rewrites leftover zustand blobs so AsyncStorage no longer contains jwt", () => {
    const raw = JSON.stringify({
      state: { currentUserChurch: church, user, fcmToken: "fcm" },
      version: 0
    });
    const cleaned = SessionTokenHelper.sanitizePersistJson(raw);
    expect(cleaned).not.toContain("church.jwt.token");
    expect(cleaned).not.toContain("membership.jwt");
    expect(cleaned).not.toContain("user.jwt.token");
    expect(cleaned).toContain("ch1");
    expect(cleaned).toContain("ada@example.com");
    expect(cleaned).not.toMatch(/"jwt":"[^"]+/);
  });

  it("stores every JWT in SecureStore keyed by church id", async () => {
    await SessionTokenHelper.storeSessionTokens(church, user.jwt);
    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("default_jwt", "user.jwt.token");
    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("church_jwt_ch1", "church.jwt.token");
    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("api_jwt_ch1_MembershipApi", "membership.jwt");
    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("api_jwt_ch1_ContentApi", "content.jwt");
    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("api_keys_ch1", "MembershipApi,ContentApi");
    expect(ApiHelper.setDefaultPermissions).toHaveBeenCalledWith("church.jwt.token");
  });

  it("does not write tokens to AsyncStorage when SecureStore fails", async () => {
    (SecureStorageHelper.setSecureItem as jest.Mock).mockRejectedValue(new Error("secure store down"));
    const setItem = jest.spyOn(AsyncStorage, "setItem");
    await SessionTokenHelper.storeSessionTokens(church, user.jwt);
    const tokenWrites = setItem.mock.calls.filter(([, value]) => typeof value === "string" && value.includes("jwt"));
    expect(tokenWrites).toEqual([]);
  });

  it("rehydrates church JWTs from SecureStore", async () => {
    (SecureStorageHelper.getSecureItem as jest.Mock).mockImplementation(async (key: string) => {
      if (key === "church_jwt_ch1") return "church.jwt.token";
      if (key === "api_keys_ch1") return "MembershipApi,ContentApi";
      if (key === "api_jwt_ch1_MembershipApi") return "membership.jwt";
      if (key === "api_jwt_ch1_ContentApi") return "content.jwt";
      return null;
    });

    const persisted = SessionTokenHelper.stripChurchSecrets(church)!;
    const hydrated = await SessionTokenHelper.hydrateChurchTokens(persisted);
    expect(hydrated.jwt).toBe("church.jwt.token");
    expect(hydrated.apis.find(api => api.keyName === "MembershipApi")?.jwt).toBe("membership.jwt");
    expect(ApiHelper.setDefaultPermissions).toHaveBeenCalledWith("church.jwt.token");
  });

  it("migrates leftover persist JWTs into SecureStore and wipes the blob", async () => {
    await AsyncStorage.setItem("church-storage", JSON.stringify({ state: { currentUserChurch: church }, version: 0 }));
    await AsyncStorage.setItem("auth-storage", JSON.stringify({ state: { user }, version: 0 }));

    await SessionTokenHelper.migrateAndWipePersistedTokens();

    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("church_jwt_ch1", "church.jwt.token");
    expect(SecureStorageHelper.setSecureItem).toHaveBeenCalledWith("default_jwt", "user.jwt.token");
    expect(SecureStorageHelper.wipeInsecureFallbacks).toHaveBeenCalled();

    const churchPersist = await AsyncStorage.getItem("church-storage");
    const authPersist = await AsyncStorage.getItem("auth-storage");
    expect(churchPersist).not.toContain("church.jwt.token");
    expect(churchPersist).not.toContain("membership.jwt");
    expect(authPersist).not.toContain("user.jwt.token");
  });
});
