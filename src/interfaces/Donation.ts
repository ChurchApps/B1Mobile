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
export interface StripeCardExpirationInterface { exp_month: string, exp_year: string }
export interface StripeCardDataInterface { card: StripeCardExpirationInterface }
export interface StripeBankAccountHolderDataInterface { account_holder_name: string, account_holder_type: string }
export interface StripeDonationIntervalInterface { interval: string, interval_count: number };
export interface StripePersonDonationInterface { id: string, email: string, name: string };
export interface StripeFundDonationInterface { id: string, amount: number, name?: string };

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

export interface MultiGatewayDonationInterface {
  id: string;
  type: "card" | "bank" | "paypal";
  provider: "stripe" | "paypal";
  customerId?: string;
  person?: {
    id?: string;
    email?: string;
    name?: string;
  };
  amount: number;
  billing_cycle_anchor?: number;
  interval?: {
    interval_count: number;
    interval: string;
  };
  funds?: StripeFundDonationInterface[];
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "paypal";
  name: string;
  last4?: string;
  email?: string;
  exp_month?: string;
  exp_year?: string;
}

export interface PaymentGateway {
  id: string;
  provider: "stripe" | "paypal";
  publicKey: string;
  enabled?: boolean;
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

export interface DonationImpact {
  id: string;
  amount: number;
  donationDate: string;
  method: string;
  methodDetails?: string | null;
  notes?: string | null;
  personId: string;
  fund?: { id: string; name: string; amount?: number };
};

export interface PaymentCard {
  id: string;
  object: "payment_method";
  allow_redisplay: string;
  billing_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
    tax_id: string | null;
  };
  card: {
    brand: string;
    checks: {
      address_line1_check: string | null;
      address_postal_code_check: string | null;
      cvc_check: string | null;
    };
    country: string;
    display_brand: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    generated_from: any;
    last4: string;
    networks: {
      available: string[];
      preferred: string | null;
    };
    regulated_status: string;
    three_d_secure_usage: {
      supported: boolean;
    };
    wallet: any;
  };
  created: number;
  customer: string;
  livemode: boolean;
  metadata: Record<string, any>;
  type: "card";
}

export interface BankAccount {
  id: string;
  object: "bank_account";
  account_holder_name: string;
  account_holder_type: "individual" | "company";
  account_type: string | null;
  bank_name: string;
  country: string;
  currency: string;
  customer: string;
  fingerprint: string;
  last4: string;
  metadata: Record<string, any>;
  routing_number: string;
  status: string;
}

export interface CustomerInfo {
  id: string;
  churchId: string;
  personId: string;
}

export interface PaymentMethodsResponse {
  cards: {
    object: "list";
    data: PaymentCard[];
    has_more: boolean;
    url: string;
  };
  banks: {
    object: "list";
    data: BankAccount[];
    has_more: boolean;
    url: string;
  };
  customer: CustomerInfo;
}

export interface GatewayData {
  id: string;
  provider: string;
  publicKey: string;
  webhookKey: string;
  productId: string;
  payFees: boolean;
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
