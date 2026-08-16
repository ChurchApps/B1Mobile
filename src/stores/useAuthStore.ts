import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserInterface, ChurchInterface, LoginUserChurchInterface, LoginResponseInterface } from "../helpers/Interfaces";
import { ApiHelper } from "@churchapps/helpers";
import { SessionTokenHelper } from "../helpers/SessionTokenHelper";
import { Platform } from "react-native";
import { logAnalyticsEvent } from "../config/firebase";
import { useChurchStore } from "./useChurchStore";
import { useEngagementStore } from "./useEngagementStore";

interface AuthState {
  user: UserInterface | null;
  churches: ChurchInterface[];
  userChurches: LoginUserChurchInterface[];

  setUser: (user: UserInterface | null) => void;
  handleLogin: (data: LoginResponseInterface) => Promise<void>;
  logout: () => Promise<void>;
  checkAccess: (params: { api: string; contentType: string; action: string }) => boolean;
  isInitialized: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      churches: [],
      userChurches: [],

      setUser: user => set({ user }),

      handleLogin: async (data: LoginResponseInterface) => {
        const churchStore = useChurchStore.getState();

        if (!data.userChurches || data.userChurches.length === 0) {
          console.error("Login response contained no user churches");
          return;
        }

        let currentChurch: LoginUserChurchInterface = data.userChurches[0];
        if (churchStore.currentUserChurch?.church?.id) {
          currentChurch = data.userChurches.find(uc => uc.church.id === churchStore.currentUserChurch?.church.id) ?? data.userChurches[0];
        }

        const churches = data.userChurches.map(uc => uc.church);

        set({ user: data.user, userChurches: data.userChurches, churches });

        ApiHelper.setDefaultPermissions(currentChurch?.jwt || "");
        currentChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));
        ApiHelper.setPermissions("MessagingApi", currentChurch?.jwt || "", []);

        if (currentChurch) {
          await churchStore.setCurrentUserChurch(currentChurch);
        }

        await logAnalyticsEvent("login", {
          id: Date.now(),
          device: Platform.OS,
          church: currentChurch.church.name
        });

        await SessionTokenHelper.storeSessionTokens(currentChurch, data.user?.jwt);

        await churchStore.loadPersonRecord();

        if (currentChurch) {
          useEngagementStore.getState().addRecentChurch(currentChurch.church);
        }
      },

      logout: async () => {
        const churchStore = useChurchStore.getState();
        const currentChurch = churchStore.currentUserChurch?.church;

        ApiHelper.setDefaultPermissions("");
        await SessionTokenHelper.clearSessionTokens(currentChurch?.id);

        set({ user: null, churches: [], userChurches: [] });

        if (currentChurch) {
          await churchStore.setAnonymousChurch(currentChurch);
        } else {
          churchStore.clearChurchState();
        }
      },

      checkAccess: ({ api, contentType, action }) => {
        const permissions = ApiHelper.getConfig(api)?.permissions;
        if (!permissions) return false;
        return permissions.some(p => p.contentType === contentType && p.action === action);
      },

      isInitialized: () => {
        const state = get();
        const churchStore = useChurchStore.getState();
        return !!(state.user && churchStore.currentUserChurch);
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => SessionTokenHelper.sanitizedAsyncStorage),
      partialize: state => ({ user: SessionTokenHelper.stripUserSecrets(state.user) })
    }
  )
);
