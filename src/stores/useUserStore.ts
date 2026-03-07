// Facade — re-exports from focused stores for backward compatibility.
// New code should import from useAuthStore, useChurchStore, or useEngagementStore directly.

import { useAuthStore } from "./useAuthStore";
import { useChurchStore } from "./useChurchStore";
import { useEngagementStore } from "./useEngagementStore";

export { useAuthStore } from "./useAuthStore";
export { useChurchStore } from "./useChurchStore";
export { useEngagementStore } from "./useEngagementStore";

// Unified store accessor for legacy code using useUserStore.getState()
export const useUserStore = {
  getState: () => ({
    ...useAuthStore.getState(),
    ...useChurchStore.getState(),
    ...useEngagementStore.getState()
  })
};

// Initialize all stores from persistence
export async function initializeFromPersistence() {
  await useChurchStore.getState().initializeFromPersistence();
}

// Convenience hooks — same signatures as before
export const useUser = () => useAuthStore(state => state.user);
export const useCurrentChurch = () => useChurchStore(state => state.currentUserChurch?.church);
export const useCurrentUserChurch = () => useChurchStore(state => state.currentUserChurch);
export const useChurchAppearance = () => useChurchStore(state => state.churchAppearance);
export const useUserChurches = () => useAuthStore(state => state.userChurches);
export const useRecentChurches = () => useEngagementStore(state => state.recentChurches);
export const useGroupViewCounts = () => useEngagementStore(state => state.groupViewCounts);
export const useIncrementGroupViewCount = () => useEngagementStore(state => state.incrementGroupViewCount);
export const useLinkViewCounts = () => useEngagementStore(state => state.linkViewCounts);
export const useIncrementLinkViewCount = () => useEngagementStore(state => state.incrementLinkViewCount);
