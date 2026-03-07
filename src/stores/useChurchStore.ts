import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChurchInterface, LoginUserChurchInterface, AppearanceInterface, PersonInterface } from "../helpers/Interfaces";
import { ApiHelper } from "@churchapps/helpers";
import { SecureStorageHelper } from "../helpers/SecureStorageHelper";
import { PushNotificationHelper } from "../helpers/PushNotificationHelper";
import { useEngagementStore } from "./useEngagementStore";

interface ChurchState {
  currentUserChurch: LoginUserChurchInterface | null;
  churchAppearance: AppearanceInterface | null;
  links: any[];
  fcmToken: string;

  setCurrentUserChurch: (userChurch: LoginUserChurchInterface, appearance?: AppearanceInterface) => Promise<void>;
  setChurchAppearance: (appearance: AppearanceInterface) => void;
  setLinks: (links: any[]) => void;
  setFcmToken: (token: string) => void;
  selectChurch: (church: ChurchInterface) => Promise<void>;
  setAnonymousChurch: (church: ChurchInterface) => Promise<void>;
  loadChurchLinks: (churchId: string) => Promise<void>;
  loadPersonRecord: () => Promise<void>;
  clearChurchState: () => void;
  initializeFromPersistence: () => Promise<void>;
}

export const useChurchStore = create<ChurchState>()(
  persist(
    (set, get) => ({
      currentUserChurch: null,
      churchAppearance: null,
      links: [],
      fcmToken: "",

      setCurrentUserChurch: async (userChurch, appearance) => {
        set({ currentUserChurch: userChurch });

        if (appearance) {
          set({ churchAppearance: appearance });
        } else {
          ApiHelper.getAnonymous(`/settings/public/${userChurch.church.id}`, "MembershipApi")
            .then((fetchedAppearance: AppearanceInterface) => set({ churchAppearance: fetchedAppearance }))
            .catch((error: any) => console.error("Failed to fetch church appearance:", error));
        }

        get().loadChurchLinks(userChurch.church.id || "").catch(error => console.error("Failed to load church links:", error));

        if (userChurch.jwt) {
          get().loadPersonRecord().catch(error => console.error("Failed to load person record:", error));
        }
      },

      setChurchAppearance: appearance => set({ churchAppearance: appearance }),
      setLinks: links => set({ links }),
      setFcmToken: token => set({ fcmToken: token }),

      selectChurch: async (church: ChurchInterface) => {
        // Import lazily to avoid circular dependency
        const { useAuthStore } = require("./useAuthStore");
        const authState = useAuthStore.getState();
        const userChurch = authState.userChurches.find((uc: LoginUserChurchInterface) => uc.church.id === church.id);

        if (userChurch) {
          useEngagementStore.getState().addRecentChurch(church);

          ApiHelper.setDefaultPermissions(userChurch.jwt || "");
          userChurch.apis?.forEach((api: any) => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));

          await get().setCurrentUserChurch(userChurch);

          setTimeout(() => {
            storeSecureTokens(userChurch);
          }, 200);
        } else {
          await get().setAnonymousChurch(church);
        }
      },

      setAnonymousChurch: async (church: ChurchInterface) => {
        const anonymousUserChurch: LoginUserChurchInterface = { person: null, church, jwt: "", apis: [], groups: [] };

        set({ currentUserChurch: anonymousUserChurch });
        useEngagementStore.getState().addRecentChurch(church);

        ApiHelper.getAnonymous(`/settings/public/${church.id}`, "MembershipApi")
          .then(appearance => set({ churchAppearance: appearance }))
          .catch(error => console.error("Failed to fetch church appearance:", error));

        get().loadChurchLinks(church.id || "").catch(error => console.error("Failed to load church links:", error));
      },

      loadChurchLinks: async (churchId: string) => {
        try {
          const state = get();
          let links: any[];

          if (state.currentUserChurch?.jwt) {
            try {
              const fetchedLinks = await ApiHelper.get(`/links/church/${churchId}/filtered?category=b1Tab`, "ContentApi");
              const userGroupTags = state.currentUserChurch.groups?.flatMap((g: any) => g.tags?.split(",") || []) || [];
              links = fetchedLinks.filter((link: any) => {
                if (link.visibility === "team") return userGroupTags.includes("team");
                return true;
              });
            } catch (authError) {
              console.warn("Authenticated links call failed, falling back to anonymous:", authError);
              const allLinks = await ApiHelper.getAnonymous(`/links/church/${churchId}?category=b1Tab`, "ContentApi");
              links = allLinks.filter((link: any) => !link.visibility || link.visibility === "everyone");
            }
          } else {
            const allLinks = await ApiHelper.getAnonymous(`/links/church/${churchId}?category=b1Tab`, "ContentApi");
            links = allLinks.filter((link: any) => !link.visibility || link.visibility === "everyone");
          }

          set({ links });
        } catch (error) {
          console.error("Failed to load church links:", error);
          set({ links: [] });
        }
      },

      loadPersonRecord: async () => {
        const state = get();
        if (state.currentUserChurch) {
          if (!state.currentUserChurch.person || !state.currentUserChurch.person.name) {
            try {
              const data: { person: PersonInterface } = await ApiHelper.get(`/people/claim/${state.currentUserChurch.church.id}`, "MembershipApi");
              set({
                currentUserChurch: {
                  ...state.currentUserChurch,
                  person: data.person
                }
              });
            } catch (error) {
              console.error("Failed to load person record:", error);
            }
          }

          if (state.currentUserChurch.person?.id) {
            PushNotificationHelper.registerUserDevice();
          }
        }
      },

      clearChurchState: () => {
        set({
          currentUserChurch: null,
          churchAppearance: null,
          links: []
        });
      },

      initializeFromPersistence: async () => {
        const state = get();

        if (state.currentUserChurch?.church) {
          const churchId = state.currentUserChurch.church.id;

          if (!state.churchAppearance) {
            try {
              const appearance = await ApiHelper.getAnonymous(`/settings/public/${churchId}`, "MembershipApi");
              set({ churchAppearance: appearance });
            } catch (error) {
              console.error("Failed to load church appearance:", error);
            }
          }

          if (!state.links || state.links.length === 0) {
            await get().loadChurchLinks(churchId);
          }

          if (state.currentUserChurch.jwt && !state.currentUserChurch.person) {
            await get().loadPersonRecord();
          }

          if (state.currentUserChurch.jwt) {
            ApiHelper.setDefaultPermissions(state.currentUserChurch.jwt);
            state.currentUserChurch.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));
            ApiHelper.setPermissions("MessagingApi", state.currentUserChurch.jwt, []);
          }
        }
      }
    }),
    {
      name: "church-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        currentUserChurch: state.currentUserChurch,
        fcmToken: state.fcmToken
      })
    }
  )
);

async function storeSecureTokens(userChurch: LoginUserChurchInterface): Promise<void> {
  try {
    if (userChurch?.apis && userChurch.apis.length > 0) {
      userChurch.apis.forEach(api => {
        if (api.keyName && api.jwt) {
          ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions || []);
        }
      });

      if (userChurch.jwt) {
        ApiHelper.setPermissions("MessagingApi", userChurch.jwt, []);
      }
    }
  } catch (error) {
    console.error("Failed to store secure tokens:", error);
  }
}
