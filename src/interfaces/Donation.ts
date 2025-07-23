import { PersonInterface } from "./Membership";

export interface DonationInterface {
  id?: string;
  batchId?: string;
  personId?: string;
  donationDate?: Date;
  amount?: number;
  method?: string;
  methodDetails?: string;
  notes?: string;
  person?: PersonInterface;
  fund?: FundInterface;
}
export interface FundInterface {
  id: string;
  name: string;
  amount?: number;
}
export interface FundDonationInterface {
  id?: string;
  donationId?: string;
  fundId?: string;
  amount?: number;
  donation?: DonationInterface;
}
export interface PaymentMethodInterface {
  id?: string;
  churchId?: string;
  personId?: string;
  customerId?: string;
  email?: string;
  name?: string;
}
export interface StripeCardUpdateInterface {
  paymentMethodId: string;
  cardData: StripeCardDataInterface;
  personId?: string;
}
export interface StripeBankAccountUpdateInterface {
  paymentMethodId: string;
  customerId: string;
  personId?: string;
  bankData: StripeBankAccountHolderDataInterface;
}
export interface StripeBankAccountVerifyInterface {
  customerId: string;
  paymentMethodId: string;
  amountData: { amounts: string[] };
}
export interface StripeDonationInterface {
  id?: string;
  type?: string;
  amount?: number;
  customerId?: string;
  billing_cycle_anchor?: number;
  proration_behavior?: string;
  interval?: StripeDonationIntervalInterface;
  person?: StripePersonDonationInterface;
  funds?: StripeFundDonationInterface[];
  notes?: string;
  churchId?: string;
  church?: { name?: string; subDomain?: string };
}
export interface SubscriptionInterface {
  id: string;
  funds: [];
  billing_cycle_anchor: number;
  default_payment_method: string;
  default_source: string;
  plan: { amount: number; interval: string; interval_count: number };
  customer: string;
}

export class StripePaymentMethod {
  id: string;
  type: string;
  name: string;
  last4: string;
  exp_month?: string;
  exp_year?: string;
  status?: string;
  account_holder_name?: string;
  account_holder_type?: string;

  constructor(obj?: any) {
    this.id = obj?.id || null;
    this.type = obj?.type || (obj?.object && obj.object === "bank_account" ? "bank" : null);
    this.name = obj?.card?.brand || obj?.bank_name || null;
    this.last4 = obj?.last4 || obj?.card?.last4 || null;
    this.exp_month = obj?.exp_month || obj?.card?.exp_month || null;
    this.exp_year = obj?.exp_year || obj?.card?.exp_year || null;
    this.status = obj?.status || null;
    this.account_holder_name = obj?.account_holder_name || "";
    this.account_holder_type = obj?.account_holder_type || "individual";
  }
}
