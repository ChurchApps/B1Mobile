import { useQuery } from "@tanstack/react-query";
import { ApiHelper } from "../mobilehelper";

export const useChurchSettings = (churchId?: string) =>
  useQuery({
    queryKey: [`/settings/public/${churchId}`, "MembershipApi"],
    queryFn: async () => {
      if (!churchId) return null;
      return ApiHelper.getAnonymous(`/settings/public/${churchId}`, "MembershipApi");
    },
    enabled: !!churchId,
    placeholderData: null,
    staleTime: 30 * 60 * 1000, // 30 minutes - church settings rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
    networkMode: "offlineFirst"
  });
