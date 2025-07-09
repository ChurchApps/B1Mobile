export class CacheHelper {
  // CacheHelper is now deprecated - all state is managed in useUserStore
  // This class remains only for backward compatibility during migration

  static setValue = async () => {
    // No-op for now - will be removed in future update
    console.warn(`CacheHelper.setValue is deprecated. Use useUserStore instead.`);
  };

  static loadFromStorage = async () => {
    // No-op for now - will be removed in future update
    console.warn(`CacheHelper.loadFromStorage is deprecated. Use useUserStore instead.`);
  };
}
