import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserInterface, ChurchInterface, LoginUserChurchInterface, AppearanceInterface, PersonInterface, LoginResponseInterface, LinkInterface } from "../helpers/Interfaces";
import { ApiHelper } from "@churchapps/helpers";
import { SecureStorageHelper } from "../helpers/SecureStorageHelper";
import { PushNotificationHelper } from "../helpers/PushNotificationHelper";
import { Platform } from "react-native";
import { logAnalyticsEvent } from "../config/firebase";

interface UserState {
  // Core user data
  user: UserInterface | null;
  churches: ChurchInterface[];
  userChurches: LoginUserChurchInterface[];
  currentUserChurch: LoginUserChurchInterface | null;
  churchAppearance: AppearanceInterface | null;
  links: any[];

  // Recent churches for quick switching
  recentChurches: ChurchInterface[];

  // Group view tracking
  groupViewCounts: Record<string, number>;

  // Link view tracking
  linkViewCounts: Record<string, number>;

  // FCM token for push notifications
  fcmToken: string;

  // Actions
  setUser: (user: UserInterface | null) => void;
  setCurrentUserChurch: (userChurch: LoginUserChurchInterface, appearance?: AppearanceInterface) => Promise<void>;
  setChurchAppearance: (appearance: AppearanceInterface) => void;
  setLinks: (links: any[]) => void;
  setFcmToken: (token: string) => void;
  addRecentChurch: (church: ChurchInterface) => void;
  incrementGroupViewCount: (groupId: string) => void;
  incrementLinkViewCount: (linkId: string) => void;

  // Complex actions
  handleLogin: (data: LoginResponseInterface) => Promise<void>;
  selectChurch: (church: ChurchInterface) => Promise<void>;
  setAnonymousChurch: (church: ChurchInterface) => Promise<void>;
  loadChurchLinks: (churchId: string) => Promise<void>;
  initializeFromPersistence: () => Promise<void>;
  logout: () => Promise<void>;
  loadPersonRecord: () => Promise<void>;

  // Helper methods
  checkAccess: (params: { api: string; contentType: string; action: string }) => boolean;
  isInitialized: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      churches: [],
      userChurches: [],
      currentUserChurch: null,
      churchAppearance: null,
      links: [],
      recentChurches: [],
      groupViewCounts: {},
      linkViewCounts: {},
      fcmToken: "",

      // Basic setters
      setUser: user => set({ user }),

      setCurrentUserChurch: async (userChurch, appearance) => {
        set({ currentUserChurch: userChurch });

        // Progressive: Load appearance in background (non-blocking)
        if (appearance) {
          set({ churchAppearance: appearance });
        } else {
          // Load appearance without blocking UI
          setTimeout(async () => {
            try {
              const fetchedAppearance = await ApiHelper.getAnonymous(`/settings/public/${userChurch.church.id}`, "MembershipApi");
              set({ churchAppearance: fetchedAppearance });
            } catch (error) {
              console.error("Failed to fetch church appearance:", error);
            }
          }, 0);
        }

        // Progressive: Load church links without blocking UI
        setTimeout(() => {
          get().loadChurchLinks(userChurch.church.id || "");
        }, 50);

        // Deferred: Load person record after initial render
        if (userChurch.jwt) {
          setTimeout(() => {
            get().loadPersonRecord();
          }, 100);
        }
      },

      setChurchAppearance: appearance => set({ churchAppearance: appearance }),

      setLinks: links => set({ links }),

      setFcmToken: token => set({ fcmToken: token }),

      addRecentChurch: church => {
        const state = get();
        const filtered = state.recentChurches.filter(c => c.id !== church.id);
        const updated = [church, ...filtered].slice(0, 5); // Keep only 5 recent churches
        set({ recentChurches: updated });
      },

      incrementGroupViewCount: groupId => {
        const state = get();
        const currentCount = state.groupViewCounts[groupId] || 0;
        set({
          groupViewCounts: {
            ...state.groupViewCounts,
            [groupId]: currentCount + 1
          }
        });
      },

      incrementLinkViewCount: linkId => {
        const state = get();
        const currentCount = state.linkViewCounts[linkId] || 0;
        set({
          linkViewCounts: {
            ...state.linkViewCounts,
            [linkId]: currentCount + 1
          }
        });
      },

      // Handle login response
      handleLogin: async (data: LoginResponseInterface) => {
        const state = get();

        // Find the current church or use the first one
        let currentChurch: LoginUserChurchInterface = data.userChurches[0];
        if (state.currentUserChurch?.church?.id) {
          currentChurch = data.userChurches.find(uc => uc.church.id === state.currentUserChurch?.church.id) ?? data.userChurches[0];
        }

        // Extract churches list
        const churches = data.userChurches.map(uc => uc.church);

        // Update state
        set({
          user: data.user,
          userChurches: data.userChurches,
          churches: churches
        });

        // Set API permissions BEFORE setCurrentUserChurch (which triggers loadChurchLinks)
        ApiHelper.setDefaultPermissions(currentChurch?.jwt || "");
        currentChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));
        ApiHelper.setPermissions("MessagingApi", currentChurch?.jwt || "", []);

        // Set current user church (triggers loadChurchLinks which needs API permissions)
        if (currentChurch) {
          await get().setCurrentUserChurch(currentChurch);
        }

        // Analytics
        await logAnalyticsEvent("login", {
          id: Date.now(),
          device: Platform.OS,
          church: currentChurch.church.name
        });

        // Store JWT tokens securely
        await storeSecureTokens(currentChurch);

        // Load person record
        await get().loadPersonRecord();

        // Add to recent churches
        if (currentChurch) {
          get().addRecentChurch(currentChurch.church);
        }
      },

      // Select a different church
      selectChurch: async (church: ChurchInterface) => {
        const state = get();
        const userChurch = state.userChurches.find(uc => uc.church.id === church.id);

        if (userChurch) {
          // Essential: Set church immediately for fast UI update
          get().addRecentChurch(church);
          
          // Essential: Update API permissions immediately
          ApiHelper.setDefaultPermissions(userChurch.jwt || "");
          userChurch.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));

          // Progressive: Set current church (triggers background loading)
          await get().setCurrentUserChurch(userChurch);

          // Deferred: Store JWT tokens in background
          setTimeout(() => {
            storeSecureTokens(userChurch);
          }, 200);
        } else {
          // Anonymous church selection (user not logged in to this church)
          await get().setAnonymousChurch(church);
        }
      },

      // Set church for anonymous browsing (when user isn't logged in)
      setAnonymousChurch: async (church: ChurchInterface) => {
        // Create a minimal LoginUserChurchInterface for anonymous browsing
        const anonymousUserChurch: LoginUserChurchInterface = {
          person: null,
          church: church,
          jwt: "",
          apis: [],
          groups: []
        };

        // Essential: Set church immediately for fast UI update
        set({ currentUserChurch: anonymousUserChurch });
        get().addRecentChurch(church);

        // Progressive: Fetch church appearance in background
        setTimeout(async () => {
          try {
            const appearance = await ApiHelper.getAnonymous(`/settings/public/${church.id}`, "MembershipApi");
            set({ churchAppearance: appearance });
          } catch (error) {
            console.error("❌ Failed to fetch church appearance:", error);
          }
        }, 0);

        // Deferred: Load church links after initial render
        setTimeout(() => {
          get().loadChurchLinks(church.id || "");
        }, 100);
      },

      // Load church navigation links
      loadChurchLinks: async (churchId: string) => {
        try {
          const state = get();
          let links: any[];

          // Use authenticated endpoint if user is logged in
          // ApiHelper uses the church JWT set by setDefaultPermissions
          if (state.currentUserChurch?.jwt) {
            try {
              const fetchedLinks = await ApiHelper.get(`/links/church/${churchId}/filtered?category=b1Tab`, "ContentApi");
              // Filter "team" visibility client-side (group tags aren't in JWT)
              const userGroupTags = state.currentUserChurch.groups?.flatMap((g: any) => g.tags?.split(",") || []) || [];
              links = fetchedLinks.filter((link: any) => {
                if (link.visibility === "team") return userGroupTags.includes("team");
                return true;
              });
            } catch (authError) {
              // Fall back to anonymous if authenticated call fails
              console.warn("Authenticated links call failed, falling back to anonymous:", authError);
              const allLinks = await ApiHelper.getAnonymous(`/links/church/${churchId}?category=b1Tab`, "ContentApi");
              links = allLinks.filter((link: any) => !link.visibility || link.visibility === "everyone");
            }
          } else {
            const allLinks = await ApiHelper.getAnonymous(`/links/church/${churchId}?category=b1Tab`, "ContentApi");
            // Filter client-side for anonymous users (only "everyone" visibility)
            links = allLinks.filter((link: any) => !link.visibility || link.visibility === "everyone");
          }

          set({ links });
        } catch (error) {
          console.error("❌ Failed to load church links:", error);
          set({ links: [] });
        }
      },

      // Initialize app from persisted data
      initializeFromPersistence: async () => {
        const state = get();

        if (state.currentUserChurch?.church) {
          const churchId = state.currentUserChurch.church.id;

          // Load church appearance if not already loaded
          if (!state.churchAppearance) {
            try {
              const appearance = await ApiHelper.getAnonymous(`/settings/public/${churchId}`, "MembershipApi");
              set({ churchAppearance: appearance });
            } catch (error) {
              console.error("❌ Failed to load church appearance:", error);
            }
          }

          // Load church links if not already loaded
          if (!state.links || state.links.length === 0) {
            await get().loadChurchLinks(churchId);
          }

          // Load person record if user is logged in and person not loaded
          if (state.currentUserChurch.jwt && !state.currentUserChurch.person) {
            await get().loadPersonRecord();
          }

          // Set API permissions if we have a JWT
          if (state.currentUserChurch.jwt) {
            ApiHelper.setDefaultPermissions(state.currentUserChurch.jwt);
            state.currentUserChurch.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));
            ApiHelper.setPermissions("MessagingApi", state.currentUserChurch.jwt, []);
          }
        }
      },

      // Logout
      logout: async () => {
        const state = get();
        const currentChurch = state.currentUserChurch?.church;

        // Clear API permissions
        ApiHelper.setDefaultPermissions("");

        // Clear secure storage (only JWT token now)
        await SecureStorageHelper.removeSecureItem("default_jwt");

        // Clear user-specific state but preserve church context
        set({
          user: null,
          churches: [],
          userChurches: [],
          currentUserChurch: currentChurch
            ? {
                person: null,
                church: currentChurch,
                jwt: "",
                apis: [],
                groups: []
              }
            : null
          // Keep churchAppearance and links so UI stays consistent
          // churchAppearance: null,
          // links: []
        });

        // If we have a current church, reload its public data for anonymous browsing
        if (currentChurch) {
          await get().setAnonymousChurch(currentChurch);
        }
      },

      // Load person record for current church
      loadPersonRecord: async () => {
        const state = get();
        if (state.currentUserChurch && (!state.currentUserChurch.person || !state.currentUserChurch.person.name)) {
          try {
            const data: { person: PersonInterface } = await ApiHelper.get(`/people/claim/${state.currentUserChurch.church.id}`, "MembershipApi");

            // Update the current user church with person data
            set({
              currentUserChurch: {
                ...state.currentUserChurch,
                person: data.person
              }
            });

            // Register for push notifications
            PushNotificationHelper.registerUserDevice();
          } catch (error) {
            console.error("Failed to load person record:", error);
          }
        }
      },

      // Check access permissions
      checkAccess: ({ api, contentType, action }) => {
        const permissions = ApiHelper.getConfig(api)?.permissions;

        if (!permissions) return false;

        return permissions.some(p => p.contentType === contentType && p.action === action);
      },

      // Check if user is initialized (logged in)
      isInitialized: () => {
        const state = get();
        return !!(state.user && state.currentUserChurch);
      }
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        // Only persist essential data
        user: state.user,
        currentUserChurch: state.currentUserChurch,
        recentChurches: state.recentChurches,
        groupViewCounts: state.groupViewCounts,
        linkViewCounts: state.linkViewCounts,
        fcmToken: state.fcmToken
      })
    }
  )
);

// Helper function to store JWT tokens securely
async function storeSecureTokens(userChurch: LoginUserChurchInterface): Promise<void> {
  try {
    // Only store the main JWT token to avoid SecureStore size limits
    if (userChurch?.jwt) {
      await SecureStorageHelper.setSecureItem("default_jwt", userChurch.jwt);
    }

    // Set API permissions in memory (they'll be refreshed on app restart)
    if (userChurch?.apis && userChurch.apis.length > 0) {
      userChurch.apis.forEach(api => {
        if (api.keyName && api.jwt) {
          ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions || []);
        }
      });

      // Also set MessagingApi token
      if (userChurch.jwt) {
        ApiHelper.setPermissions("MessagingApi", userChurch.jwt, []);
      }
    }
  } catch (error) {
    console.error("Failed to store secure tokens:", error);
  }
}

// Convenience hooks for specific parts of the state
export const useUser = () => useUserStore(state => state.user);
export const useCurrentChurch = () => useUserStore(state => state.currentUserChurch?.church);
export const useCurrentUserChurch = () => useUserStore(state => state.currentUserChurch);
export const useChurchAppearance = () => useUserStore(state => state.churchAppearance);
export const useUserChurches = () => useUserStore(state => state.userChurches);
export const useRecentChurches = () => useUserStore(state => state.recentChurches);
export const useGroupViewCounts = () => useUserStore(state => state.groupViewCounts);
export const useIncrementGroupViewCount = () => useUserStore(state => state.incrementGroupViewCount);
export const useLinkViewCounts = () => useUserStore(state => state.linkViewCounts);
export const useIncrementLinkViewCount = () => useUserStore(state => state.incrementLinkViewCount);
