import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserInterface, ChurchInterface, LoginUserChurchInterface, AppearanceInterface, PersonInterface, LoginResponseInterface } from "../helpers/Interfaces";
import { ApiHelper } from "../mobilehelper";
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
  getSpecialTabs: (churchId: string) => Promise<any[]>;
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

        // Set current user church
        if (currentChurch) {
          await get().setCurrentUserChurch(currentChurch);
        }

        // Analytics
        await logAnalyticsEvent("login", {
          id: Date.now(),
          device: Platform.OS,
          church: currentChurch.church.name
        });

        // Set API permissions
        ApiHelper.setDefaultPermissions(currentChurch?.jwt || "");
        currentChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));
        ApiHelper.setPermissions("MessagingApi", currentChurch?.jwt || "", []);

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
          // Get main navigation links first
          let tabs: any[] = [];
          const tempTabs = await ApiHelper.getAnonymous(`/links/church/${churchId}?category=b1Tab`, "ContentApi");

          tempTabs.forEach((tab: any) => {
            switch (tab.linkType) {
              case "groups":
              case "donation":
              case "directory":
              case "plans":
              case "lessons":
              case "website":
              case "checkin":
                break;
              default:
                tabs.push(tab);
                break;
            }
          });

          // Load special tabs (feature availability) before updating state
          try {
            const specialTabs = await get().getSpecialTabs(churchId);
            const allLinks = tabs.concat(specialTabs);
            // Only update state once with complete data
            set({ links: allLinks });
          } catch (error) {
            console.error("❌ Failed to load special tabs:", error);
            // Set basic tabs only if special tabs fail
            set({ links: tabs });
          }
        } catch (error) {
          console.error("❌ Failed to load church links:", error);
          set({ links: [] });
        }
      },

      // Get special navigation tabs based on church features
      getSpecialTabs: async (churchId: string) => {
        const state = get();
        let specialTabs: any[] = [];
        let showWebsite = false,
          showDonations = false,
          showMyGroups = false,
          showPlans = false,
          showDirectory = false,
          showLessons = false,
          showChums = false,
          showCheckin = false,
          showSermons = false;

        const uc = state.currentUserChurch;

        try {
          // Check for website
          const page = await ApiHelper.getAnonymous(`/pages/${churchId}/tree?url=/`, "ContentApi");
          if (page.url) showWebsite = true;

          // Check for donations
          const gateways = await ApiHelper.getAnonymous(`/gateways/churchId/${churchId}`, "GivingApi");
          if (gateways.length > 0) showDonations = true;

          // Check for sermons
          try {
            const playlists = await ApiHelper.getAnonymous(`/playlists/public/${churchId}`, "ContentApi");
            if (playlists.length > 0) showSermons = true;
          } catch (error) {
            console.error("Error checking for sermons in store:", error);
            // Still show sermons tab - let the sermons screen handle the error
            showSermons = true;
          }
        } catch (error) {
          console.error("❌ Error checking church features:", error);
        }

        // User-specific features (only if logged in)
        if (uc?.person) {
          try {
            const classrooms = await ApiHelper.get("/classrooms/person", "LessonsApi");
            showLessons = classrooms.length > 0;
          } catch {
            // Ignore error
          }
          try {
            const campuses = await ApiHelper.get("/campuses", "AttendanceApi");
            showCheckin = campuses.length > 0;
          } catch {
            // Ignore error
          }
          showChums = state.checkAccess({ api: "MembershipApi", contentType: "people", action: "edit" });
          const memberStatus = uc.person?.membershipStatus?.toLowerCase();
          showDirectory = memberStatus === "member" || memberStatus === "staff";

          // Check for groups
          if (uc.groups && uc.groups.length > 0) {
            showMyGroups = true;
          }

          // Check for plans
          try {
            const plans = await ApiHelper.get("/plans", "DoingApi");
            showPlans = plans.length > 0;
          } catch {
            // Ignore error
          }
        }

        // Build special tabs array

        if (showMyGroups) specialTabs.push({ linkType: "groups", text: "My Groups", icon: "groups" });
        if (showDonations) specialTabs.push({ linkType: "donation", text: "Giving", icon: "volunteer_activism" });
        if (showDirectory) specialTabs.push({ linkType: "directory", text: "Directory", icon: "people" });
        if (showPlans) specialTabs.push({ linkType: "plans", text: "Plans", icon: "calendar_today" });
        if (showLessons) specialTabs.push({ linkType: "lessons", text: "Lessons", icon: "local_library" });
        if (showSermons) specialTabs.push({ linkType: "sermons", text: "Sermons", icon: "play_circle" });
        if (showWebsite) specialTabs.push({ linkType: "website", text: "Website", icon: "language" });
        if (showCheckin) specialTabs.push({ linkType: "checkin", text: "Check-in", icon: "how_to_reg" });
        if (showChums) specialTabs.push({ linkType: "chums", text: "Member Search", icon: "person_search" });

        return specialTabs;
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
