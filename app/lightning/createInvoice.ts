import { getTokens, refreshTokens } from "./token";

interface CreateInvoiceResponse {
  amount: number;
  boostagram?: null;
  comment?: null | string;
  created_at: string;
  creation_date: number;
  currency: "btc";
  custom_records?: any | null;
  description_hash?: string | null;
  expires_at: string;
  expiry: number;
  fiat_currency: "USD";
  fiat_in_cents: number;
  identifier: string;
  keysend_message?: string | null;
  memo?: string | null;
  payer_name: null;
  payer_email: null;
  payer_pubkey: null;
  payment_hash: string;
  payment_request: string;
  r_hash_str: string;
  state: "CREATED";
  type: "incoming";
  value: number;
}

interface CreateInvoiceArgs {
  amount: number;
  description?: string;
  description_hash?: string;
  currency?: "btc";
  memo?: string;
  comment?: string;
  metadata?: Record<string, any>;
  payer_name?: string;
  payer_email?: string;
  payer_pubkey?: string;
}

export default async function createInvoice(
  args: CreateInvoiceArgs,
  retry?: boolean,
): Promise<CreateInvoiceResponse> {
  if (retry) {
    await refreshTokens();
  }

  const { accessToken } = await getTokens();

  const res = await fetch("https://api.getalby.com/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(args),
  }).then((r) => r.json());

  if (res.error) {
    return createInvoice(args, true);
  }

  return res;
}
