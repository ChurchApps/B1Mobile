const ALLOWED_HOSTS = ["b1.church", "lessons.church", "churchapps.org"];
const EXPECTED_EVENTS = ["profile_updated", "profile_deleted"];

export class WebViewAllowlist {
  static normalizeUrl(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
    return "";
  }

  static isAllowedUrl(value: unknown): boolean {
    const url = this.normalizeUrl(value);
    if (!url) return false;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return false;
      if (parsed.username || parsed.password) return false;
      const host = parsed.hostname.toLowerCase();
      if (!host) return false;
      return ALLOWED_HOSTS.some(domain => host === domain || host.endsWith("." + domain));
    } catch {
      return false;
    }
  }

  static isSafeExternalUrl(value: unknown): boolean {
    const url = this.normalizeUrl(value);
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  static shouldLoadInWebView(request: { url?: string; isTopFrame?: boolean }): boolean {
    if (request.isTopFrame === false) return true;
    return this.isAllowedUrl(request.url);
  }

  static isExpectedEvent(eventName: unknown): boolean {
    return typeof eventName === "string" && EXPECTED_EVENTS.includes(eventName);
  }

  static parseMessage(data: unknown): { event?: string } | null {
    if (typeof data !== "string") return null;
    try {
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static acceptedMessage(sourceUrl: unknown, data: unknown): { event?: string } | null {
    if (!this.isAllowedUrl(sourceUrl)) return null;
    const message = this.parseMessage(data);
    if (!message || !this.isExpectedEvent(message.event)) return null;
    return message;
  }
}
