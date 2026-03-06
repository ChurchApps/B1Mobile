import { DonationInterface, FundDonationInterface, FundInterface } from "@churchapps/helpers";
import { ArrayHelper, CurrencyHelper, DateHelper } from "@churchapps/helpers";
import { PersonInterface } from "../../helpers/Interfaces";

interface ChurchInfo {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  zip?: string;
}

interface StatementParams {
  year: number;
  person?: PersonInterface;
  church?: ChurchInfo;
  funds: FundInterface[];
  fundDonations: FundDonationInterface[];
  donations: DonationInterface[];
}

export function generateStatementHtml({ year, person, church, funds, fundDonations, donations }: StatementParams): string {
  // Calculate total contributions
  let totalAmount = 0;
  const relevantFundDonations = fundDonations.filter(fd => {
    const donation = ArrayHelper.getOne(donations, "id", fd.donationId);
    if (donation) {
      totalAmount += fd.amount || 0;
      return true;
    }
    return false;
  });

  // Fund totals
  const fundTotals: Record<string, { fund: string; total: number }> = {};
  relevantFundDonations.forEach(fd => {
    const fund = ArrayHelper.getOne(funds, "id", fd.fundId);
    const donation = ArrayHelper.getOne(donations, "id", fd.donationId);
    if (donation && fund) {
      const key = fund.name || "Unknown";
      if (!fundTotals[key]) fundTotals[key] = { fund: key, total: 0 };
      fundTotals[key].total += fd.amount || 0;
    }
  });

  const fundTotalRows = Object.values(fundTotals)
    .map(ft => `<tr style="height:24px;">
      <td style="border-bottom:2px solid #1976D2;text-align:left;width:70%;padding-left:5px;">${ft.fund}</td>
      <td style="border-bottom:2px solid #1976D2;text-align:right;width:30%;padding-right:5px;">${CurrencyHelper.formatCurrency(ft.total)}</td>
    </tr>`)
    .join("");

  // Donation detail rows
  const detailRows = relevantFundDonations
    .map(fd => {
      const donation = ArrayHelper.getOne(donations, "id", fd.donationId);
      const fund = ArrayHelper.getOne(funds, "id", fd.fundId);
      if (!donation) return "";
      return `<tr style="height:28px;">
        <td style="border-bottom:2px solid #1976D2;border-right:2px solid #1976D2;text-align:left;width:20%;padding-left:5px;">${DateHelper.prettyDate(donation.donationDate)}</td>
        <td style="border-bottom:2px solid #1976D2;border-right:2px solid #1976D2;text-align:left;width:15%;padding-left:5px;">${donation.method || ""}</td>
        <td style="border-bottom:2px solid #1976D2;border-right:2px solid #1976D2;text-align:left;width:45%;padding-left:5px;">${fund?.name || ""}</td>
        <td style="border-bottom:2px solid #1976D2;border-left:2px solid #1976D2;text-align:right;width:20%;padding-right:5px;">${CurrencyHelper.formatCurrency(fd.amount || 0)}</td>
      </tr>`;
    })
    .join("");

  const now = new Date();
  const issuedDate = `${DateHelper.prettyDate(now)} ${now.toLocaleTimeString()}`;

  const personName = person?.name?.display || "";
  const contactInfo = person?.contactInfo;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #333; }
    h1 { font-size: 20px; margin: 12px 0 4px; }
    h2 { font-size: 16px; margin: 8px 0; }
    p { margin: 2px 0; font-size: 13px; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div style="border-top: 24px solid #1976D2; width: 100%;"></div>

    <h1>${year} Annual Giving Statement</h1>
    <p>Period: Jan 1 - Dec 31, ${year}</p>
    <p>Issued: ${issuedDate}</p>

    <div style="border-top: 2px solid #1976D2; width: 80%; margin: 12px 0;"></div>

    <div style="display: flex;">
      <div style="width: 50%;">
        <h1>${personName}</h1>
        <p>${contactInfo?.address1 || ""}</p>
        <p>${contactInfo?.address2 || ""}</p>
        <p>${contactInfo?.mobilePhone || ""}</p>
        <p>${contactInfo?.email || ""}</p>
      </div>
      <div style="width: 50%;">
        <h1>${church?.name || ""}</h1>
        <p>${church?.address1 || ""}</p>
        <p>${church?.address2 || ""}</p>
        <p>${[church?.city, church?.country, church?.zip].filter(Boolean).join(", ")}</p>
      </div>
    </div>

    <div style="border-top: 2px solid #1976D2; width: 80%; margin: 12px 0;"></div>

    <h1>Statement Summary:</h1>
    <div style="display: flex;">
      <div style="width: 50%;">
        <h2>Total Contributions:</h2>
        <div style="height: 60px; line-height: 60px; width: 80%; text-align: center; border: 4px solid #1976D2; font-size: 32px; font-weight: bold;">
          ${CurrencyHelper.formatCurrency(totalAmount)}
        </div>
      </div>
      <div style="width: 50%;">
        <h2>Funds:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="height: 24px;">
              <th style="border-bottom: 2px solid #1976D2; text-align: left; width: 70%; padding-left: 5px;">Fund</th>
              <th style="border-bottom: 2px solid #1976D2; text-align: right; width: 30%; padding-right: 5px;">Amount</th>
            </tr>
          </thead>
          <tbody>${fundTotalRows}</tbody>
        </table>
      </div>
    </div>

    <h1>Contribution Details:</h1>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="height: 28px;">
          <th style="border-bottom: 2px solid #1976D2; text-align: left; width: 20%; padding-left: 5px;">Date</th>
          <th style="border-bottom: 2px solid #1976D2; text-align: left; width: 15%; padding-left: 5px;">Method</th>
          <th style="border-bottom: 2px solid #1976D2; text-align: left; width: 45%; padding-left: 5px;">Fund</th>
          <th style="border-bottom: 2px solid #1976D2; text-align: right; width: 20%; padding-right: 5px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${detailRows}
        <tr style="height: 28px;">
          <td style="border-top: 2px solid #1976D2; width: 20%;"></td>
          <td style="border-top: 2px solid #1976D2; width: 15%;"></td>
          <td style="border-top: 2px solid #1976D2; text-align: right; width: 45%; padding-right: 5px; font-weight: bold;">Total Contributions:</td>
          <td style="border-top: 2px solid #1976D2; text-align: right; width: 20%; padding-right: 5px; font-weight: bold;">${CurrencyHelper.formatCurrency(totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
