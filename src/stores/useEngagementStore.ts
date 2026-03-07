import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChurchInterface } from "../helpers/Interfaces";

interface EngagementState {
  recentChurches: ChurchInterface[];
  groupViewCounts: Record<string, number>;
  linkViewCounts: Record<string, number>;

  addRecentChurch: (church: ChurchInterface) => void;
  incrementGroupViewCount: (groupId: string) => void;
  incrementLinkViewCount: (linkId: string) => void;
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      recentChurches: [],
      groupViewCounts: {},
      linkViewCounts: {},

      addRecentChurch: church => {
        const state = get();
        const filtered = state.recentChurches.filter(c => c.id !== church.id);
        const updated = [church, ...filtered].slice(0, 5);
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
      }
    }),
    {
      name: "engagement-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
