const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export function formatMoney(paise: number): string {
  return currency.format(paise / 100);
}

export function parsePrice(value: string): number | null {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const [rupees, fraction = ""] = value.trim().split(".");
  const paise = Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(paise) && paise >= 0 ? paise : null;
}
