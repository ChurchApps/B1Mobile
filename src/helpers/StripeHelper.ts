export class StripeHelper {
  static async createToken(key: string, cardDetails: any) {
    let formBody: any = [];
    for (var property in cardDetails) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(cardDetails[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const res = await fetch("https://api.stripe.com/v1/tokens", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + key,
      },
      body: formBody,
    });

    return res.json()
  }
}
