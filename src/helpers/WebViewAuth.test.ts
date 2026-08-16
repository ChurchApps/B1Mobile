import { prepareWebViewAuth } from "./WebViewAuth";

const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc-_123";

describe("prepareWebViewAuth", () => {
  it("injects the session jwt as a short-lived cookie for lessons.church", () => {
    const { uri, script } = prepareWebViewAuth("https://lessons.church/login?returnUrl=/b1/person&churchId=1", JWT);
    expect(uri).toBe("https://lessons.church/login?returnUrl=/b1/person&churchId=1");
    expect(script).toContain("jwt=" + JWT);
    expect(script).toContain("max-age=120");
    expect(script).toContain("Secure");
  });

  it("strips a jwt query parameter and moves it into the cookie", () => {
    const { uri, script } = prepareWebViewAuth("https://lessons.church/login?jwt=" + JWT + "&returnUrl=/b1/person");
    expect(uri).toBe("https://lessons.church/login?returnUrl=/b1/person");
    expect(uri).not.toContain("jwt");
    expect(script).toContain("jwt=" + JWT);
  });

  it("strips a jwt parameter in any position and preserves the hash", () => {
    expect(prepareWebViewAuth("https://lessons.church/p?a=1&jwt=" + JWT + "#frag").uri).toBe("https://lessons.church/p?a=1#frag");
    expect(prepareWebViewAuth("https://lessons.church/p?jwt=" + JWT + "#frag").uri).toBe("https://lessons.church/p#frag");
    expect(prepareWebViewAuth("https://lessons.church/p?JWT=" + JWT).uri).toBe("https://lessons.church/p");
  });

  it("prefers the session jwt over one found in the url", () => {
    const { script } = prepareWebViewAuth("https://lessons.church/login?jwt=url-token", JWT);
    expect(script).toContain("jwt=" + JWT);
    expect(script).not.toContain("url-token");
  });

  it("leaves urls without a jwt parameter untouched", () => {
    expect(prepareWebViewAuth("https://lessons.church/login").uri).toBe("https://lessons.church/login");
    expect(prepareWebViewAuth("https://lessons.church/login?a=1").uri).toBe("https://lessons.church/login?a=1");
  });

  it("never injects a token for third-party or non-https hosts", () => {
    expect(prepareWebViewAuth("https://evil.com/login", JWT).script).toBeUndefined();
    expect(prepareWebViewAuth("https://lessons.church.evil.com/login", JWT).script).toBeUndefined();
    expect(prepareWebViewAuth("https://notb1.church/login", JWT).script).toBeUndefined();
    expect(prepareWebViewAuth("http://lessons.church/login", JWT).script).toBeUndefined();
    expect(prepareWebViewAuth("not a url", JWT).script).toBeUndefined();
  });

  it("still strips a jwt parameter from third-party urls", () => {
    const { uri, script } = prepareWebViewAuth("https://evil.com/login?jwt=" + JWT + "&a=1");
    expect(uri).toBe("https://evil.com/login?a=1");
    expect(script).toBeUndefined();
  });

  it("allows first-party subdomains", () => {
    expect(prepareWebViewAuth("https://church.b1.church/login", JWT).script).toContain("jwt=" + JWT);
    expect(prepareWebViewAuth("https://b1.church/login", JWT).script).toContain("jwt=" + JWT);
  });

  it("refuses tokens carrying cookie or script metacharacters", () => {
    expect(prepareWebViewAuth("https://lessons.church/login", "abc; Domain=evil.com").script).toBeUndefined();
    expect(prepareWebViewAuth("https://lessons.church/login", "abc\";alert(1);//").script).toBeUndefined();
  });

  it("handles an empty url", () => {
    expect(prepareWebViewAuth("", JWT)).toEqual({ uri: "" });
  });
});
