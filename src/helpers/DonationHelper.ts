export class DonationHelper {

  static getInterval(intervalName:string) {
    let intervalCount = 1;
    let intervalType = "month";
    const parts = intervalName.split("_");
    if (parts.length === 2) {
      switch (parts[0]) {
        case "two": intervalCount = 2; break;
        case "three": intervalCount = 3; break;
      }
      intervalType = parts[1];
    }
    const result = { interval_count: intervalCount, interval: intervalType };
    return result;
  }

  static getIntervalKeyName(intervalCount: number, intervalType: string) {
    let firstPart = "one";
    if (intervalCount === 2) firstPart = "two";
    else if (intervalCount === 3) firstPart = "three";
    return firstPart + "_" + intervalType;
  }

  /**
   * Normalizes provider names to lowercase for consistent comparison
   * Handles various capitalizations like "Stripe", "PayPal", "Paypal", etc.
   */
  static normalizeProvider(provider: string): string {
    return provider?.toLowerCase() || "";
  }

  /**
   * Checks if a provider matches the expected provider name (case-insensitive)
   */
  static isProvider(provider: string, expectedProvider: "stripe" | "paypal"): boolean {
    return this.normalizeProvider(provider) === expectedProvider;
  }

  /**
   * Finds a gateway with the specified provider (case-insensitive)
   */
  static findGatewayByProvider(gateways: any[], provider: "stripe" | "paypal"): any {
    return gateways.find(g => this.isProvider(g.provider, provider));
  }

}
