import { WebViewAllowlist } from "./WebViewAllowlist";

describe("WebViewAllowlist", () => {
  describe("isAllowedUrl", () => {
    it("allows first-party https hosts", () => {
      expect(WebViewAllowlist.isAllowedUrl("https://b1.church/page")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://grace.b1.church/login")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://grace.staging.b1.church/stream")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://lessons.church/login?returnUrl=/b1/person")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://staging.lessons.church/b1/person")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://churchapps.org/privacy")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://content.churchapps.org/file")).toBe(true);
      expect(WebViewAllowlist.isAllowedUrl("https://api.staging.churchapps.org/membership")).toBe(true);
    });

    it("rejects hostile and malformed urls", () => {
      expect(WebViewAllowlist.isAllowedUrl("https://evil.com")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("https://b1.church.evil.com")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("https://evilb1.church")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("https://lessons.church.attacker.com")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("http://grace.b1.church")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("javascript:alert(1)")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("data:text/html,hi")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("file:///etc/passwd")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("https://user:pass@grace.b1.church")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("b1mobile://websiteUrl?url=https://evil.com")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("not a url")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl("")).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl(undefined)).toBe(false);
      expect(WebViewAllowlist.isAllowedUrl(["https://evil.com"])).toBe(false);
    });

    it("allows the first string when expo params are an allowed array", () => {
      expect(WebViewAllowlist.isAllowedUrl(["https://grace.b1.church/page"])).toBe(true);
    });
  });

  describe("shouldLoadInWebView", () => {
    it("keeps first-party top-frame urls in the webview", () => {
      expect(WebViewAllowlist.shouldLoadInWebView({ url: "https://grace.b1.church/page" })).toBe(true);
      expect(WebViewAllowlist.shouldLoadInWebView({ url: "https://lessons.church/login", isTopFrame: true })).toBe(true);
    });

    it("blocks hostile top-frame urls and allows subframe requests", () => {
      expect(WebViewAllowlist.shouldLoadInWebView({ url: "https://evil.com" })).toBe(false);
      expect(WebViewAllowlist.shouldLoadInWebView({ url: "https://evil.com", isTopFrame: true })).toBe(false);
      expect(WebViewAllowlist.shouldLoadInWebView({ url: "https://fonts.googleapis.com/css", isTopFrame: false })).toBe(true);
    });
  });

  describe("isSafeExternalUrl", () => {
    it("allows http(s) only", () => {
      expect(WebViewAllowlist.isSafeExternalUrl("https://example.com")).toBe(true);
      expect(WebViewAllowlist.isSafeExternalUrl("http://example.com")).toBe(true);
      expect(WebViewAllowlist.isSafeExternalUrl("javascript:alert(1)")).toBe(false);
      expect(WebViewAllowlist.isSafeExternalUrl("data:text/html,hi")).toBe(false);
    });
  });

  describe("parseMessage / isExpectedEvent", () => {
    it("accepts expected events and ignores the rest", () => {
      expect(WebViewAllowlist.parseMessage('{"event":"profile_updated"}')).toEqual({ event: "profile_updated" });
      expect(WebViewAllowlist.parseMessage('{"event":"profile_deleted"}')).toEqual({ event: "profile_deleted" });
      expect(WebViewAllowlist.isExpectedEvent("profile_updated")).toBe(true);
      expect(WebViewAllowlist.isExpectedEvent("profile_deleted")).toBe(true);
      expect(WebViewAllowlist.isExpectedEvent("autoPrint")).toBe(false);
      expect(WebViewAllowlist.isExpectedEvent("")).toBe(false);
      expect(WebViewAllowlist.parseMessage("not-json")).toBeNull();
      expect(WebViewAllowlist.parseMessage('["profile_updated"]')).toBeNull();
    });

    it("ignores postMessage unless origin and event are allowed", () => {
      expect(WebViewAllowlist.acceptedMessage("https://grace.b1.church/profile", '{"event":"profile_updated"}')).toEqual({ event: "profile_updated" });
      expect(WebViewAllowlist.acceptedMessage("https://lessons.church/", '{"event":"profile_deleted"}')).toEqual({ event: "profile_deleted" });
      expect(WebViewAllowlist.acceptedMessage("https://evil.com", '{"event":"profile_updated"}')).toBeNull();
      expect(WebViewAllowlist.acceptedMessage("https://grace.b1.church/profile", '{"event":"autoPrint"}')).toBeNull();
      expect(WebViewAllowlist.acceptedMessage("https://grace.b1.church/profile", "print")).toBeNull();
      expect(WebViewAllowlist.acceptedMessage(undefined, '{"event":"profile_updated"}')).toBeNull();
    });
  });
});
