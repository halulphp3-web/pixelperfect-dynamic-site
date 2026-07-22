// Approximate exchange rates against AED. Used only to display converted prices.
// Update via admin later; not intended for financial accuracy.
export const RATES_VS_AED: Record<string, number> = {
  AED: 1,
  USD: 0.272,
  EUR: 0.252,
  GBP: 0.215,
  SAR: 1.021,
  INR: 22.85,
};

export const CURRENCY_SYMBOL: Record<string, string> = {
  AED: "AED",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "SAR",
  INR: "₹",
};

export function convertFromAED(amountAed: number, target: string): number {
  const rate = RATES_VS_AED[target] ?? 1;
  return amountAed * rate;
}

export function formatPrice(amountAed: number, target: string): string {
  const value = convertFromAED(amountAed, target);
  const sym = CURRENCY_SYMBOL[target] ?? target;
  const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  return `${sym} ${nf.format(Math.round(value))}`;
}
