import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiHelper } from "@churchapps/helpers";
import { LoginUserChurchInterface, UserInterface } from "./Interfaces";
import { SecureStorageHelper } from "./SecureStorageHelper";

const DEFAULT_JWT_KEY = "default_jwt";
const PERSIST_KEYS = ["church-storage", "auth-storage"];

function churchJwtKey(churchId: string) {
  return `church_jwt_${sanitizeKey(churchId)}`;
}

function churchApiJwtKey(churchId: string, keyName: string) {
  return `api_jwt_${sanitizeKey(churchId)}_${sanitizeKey(keyName)}`;
}

function churchApiKeysKey(churchId: string) {
  return `api_keys_${sanitizeKey(churchId)}`;
}

function sanitizeKey(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class SessionTokenHelper {
  static stripChurchSecrets(userChurch: LoginUserChurchInterface | null): LoginUserChurchInterface | null {
    if (!userChurch) return null;
    return { ...userChurch, jwt: "", apis: (userChurch.apis || []).map(api => ({ ...api, jwt: "" })) };
  }

  static stripUserSecrets(user: UserInterface | null): UserInterface | null {
    if (!user) return null;
    const { jwt: _jwt, ...rest } = user;
    return rest;
  }

  static sanitizePersistJson(raw: string): string {
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { return raw; }
    const state = parsed?.state;
    if (!state || typeof state !== "object") return raw;

    let changed = false;
    const nextState = { ...state };
    if (state.currentUserChurch) {
      const stripped = this.stripChurchSecrets(state.currentUserChurch);
      if (JSON.stringify(stripped) !== JSON.stringify(state.currentUserChurch)) {
        nextState.currentUserChurch = stripped;
        changed = true;
      }
    }
    if (state.user?.jwt) {
      nextState.user = this.stripUserSecrets(state.user);
      changed = true;
    }
    return changed ? JSON.stringify({ ...parsed, state: nextState }) : raw;
  }

  static sanitizedAsyncStorage = {
    getItem: async (name: string) => {
      const raw = await AsyncStorage.getItem(name);
      if (raw == null) return null;
      const cleaned = SessionTokenHelper.sanitizePersistJson(raw);
      if (cleaned !== raw) await AsyncStorage.setItem(name, cleaned);
      return cleaned;
    },
    setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
    removeItem: (name: string) => AsyncStorage.removeItem(name)
  };

  static applyToApiHelper(userChurch: LoginUserChurchInterface | null, userJwt?: string) {
    const jwt = userChurch?.jwt || userJwt || "";
    if (jwt) ApiHelper.setDefaultPermissions(jwt);
    userChurch?.apis?.forEach(api => {
      if (api.keyName && api.jwt) ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions || []);
    });
    if (userChurch?.jwt) ApiHelper.setPermissions("MessagingApi", userChurch.jwt, []);
  }

  static async storeSessionTokens(userChurch: LoginUserChurchInterface | null, userJwt?: string): Promise<void> {
    try {
      if (userJwt) await SecureStorageHelper.setSecureItem(DEFAULT_JWT_KEY, userJwt);

      const churchId = userChurch?.church?.id;
      if (!churchId) return;

      if (userChurch.jwt) await SecureStorageHelper.setSecureItem(churchJwtKey(churchId), userChurch.jwt);

      const keyNames: string[] = [];
      for (const api of userChurch.apis || []) {
        if (api.keyName && api.jwt) {
          await SecureStorageHelper.setSecureItem(churchApiJwtKey(churchId, api.keyName), api.jwt);
          keyNames.push(api.keyName);
        }
      }
      if (keyNames.length > 0) await SecureStorageHelper.setSecureItem(churchApiKeysKey(churchId), keyNames.join(","));

      this.applyToApiHelper(userChurch, userJwt);
    } catch (error) {
      console.error("Failed to store secure tokens:", error);
    }
  }

  static async hydrateUserJwt(user: UserInterface | null): Promise<UserInterface | null> {
    if (!user || user.jwt) return user;
    const jwt = await SecureStorageHelper.getSecureItem(DEFAULT_JWT_KEY);
    return jwt ? { ...user, jwt } : user;
  }

  static async hydrateChurchTokens(userChurch: LoginUserChurchInterface): Promise<LoginUserChurchInterface> {
    const churchId = userChurch.church?.id;
    if (!churchId) return userChurch;

    const jwt = await SecureStorageHelper.getSecureItem(churchJwtKey(churchId)) || "";
    const storedKeyNames = await SecureStorageHelper.getSecureItem(churchApiKeysKey(churchId));
    const keyNames = storedKeyNames ? storedKeyNames.split(",").filter(Boolean) : (userChurch.apis || []).map(api => api.keyName).filter((name): name is string => !!name);
    const existingApis = userChurch.apis || [];

    const apis = await Promise.all(keyNames.map(async keyName => {
      const existing = existingApis.find(api => api.keyName === keyName);
      const apiJwt = await SecureStorageHelper.getSecureItem(churchApiJwtKey(churchId, keyName)) || "";
      return { name: existing?.name || keyName, keyName, permissions: existing?.permissions || [], jwt: apiJwt };
    }));

    for (const api of existingApis) {
      if (api.keyName && !keyNames.includes(api.keyName)) apis.push({ ...api, jwt: "" });
    }

    const hydrated = { ...userChurch, jwt, apis };
    this.applyToApiHelper(hydrated);
    return hydrated;
  }

  static async clearSessionTokens(churchId?: string): Promise<void> {
    await SecureStorageHelper.removeSecureItem(DEFAULT_JWT_KEY);
    if (!churchId) return;

    await SecureStorageHelper.removeSecureItem(churchJwtKey(churchId));
    const keyNames = await SecureStorageHelper.getSecureItem(churchApiKeysKey(churchId));
    if (keyNames) {
      for (const keyName of keyNames.split(",").filter(Boolean)) {
        await SecureStorageHelper.removeSecureItem(churchApiJwtKey(churchId, keyName));
      }
    }
    await SecureStorageHelper.removeSecureItem(churchApiKeysKey(churchId));
  }

  static async migrateAndWipePersistedTokens(): Promise<void> {
    const churchRaw = await AsyncStorage.getItem("church-storage");
    if (churchRaw) {
      try {
        const church = JSON.parse(churchRaw)?.state?.currentUserChurch;
        if (church?.church?.id && (church.jwt || church.apis?.some((api: { jwt?: string }) => api.jwt))) {
          await this.storeSessionTokens(church);
        }
      } catch (error) {
        console.error("Failed to migrate church tokens:", error);
      }
    }

    const authRaw = await AsyncStorage.getItem("auth-storage");
    if (authRaw) {
      try {
        const userJwt = JSON.parse(authRaw)?.state?.user?.jwt;
        if (userJwt) await SecureStorageHelper.setSecureItem(DEFAULT_JWT_KEY, userJwt);
      } catch (error) {
        console.error("Failed to migrate user token:", error);
      }
    }

    for (const key of PERSIST_KEYS) {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) continue;
      const cleaned = this.sanitizePersistJson(raw);
      if (cleaned !== raw) await AsyncStorage.setItem(key, cleaned);
    }

    await SecureStorageHelper.wipeInsecureFallbacks();
  }
}
