import { LinkInterface, LoginUserChurchInterface } from "./Interfaces";

export function isLinkVisible(link: LinkInterface, user: LoginUserChurchInterface | null): boolean {
  const visibility = link.visibility || "everyone";

  switch (visibility) {
    case "everyone": return true;
    case "visitors": return !!user?.person?.id;
    case "members": {
      const status = user?.person?.membershipStatus?.toLowerCase();
      return status === "member" || status === "staff";
    }

    case "staff": return user?.person?.membershipStatus?.toLowerCase() === "staff";
    case "team": return user?.groups?.some(g => g.tags?.includes("team")) || false;

    case "groups": {
      if (!link.groupIds) return false;
      try {
        const groupIds: string[] = JSON.parse(link.groupIds);
        if (!groupIds.length) return false;
        const userGroupIds = user?.groups?.map(g => g.id) || [];
        return groupIds.some(gid => userGroupIds.includes(gid));
      } catch {
        return false;
      }
    }

    default: return true;
  }
}

export function filterVisibleLinks(links: LinkInterface[], user: LoginUserChurchInterface | null): LinkInterface[] {
  return links.filter(link => isLinkVisible(link, user));
}
