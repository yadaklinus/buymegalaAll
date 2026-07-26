export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR" | "GHS" | "KES";

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string }> = {
  NGN: { symbol: "₦", locale: "en-NG" },
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  EUR: { symbol: "€", locale: "de-DE" },
  GHS: { symbol: "GH₵", locale: "en-GH" },
  KES: { symbol: "KSh ", locale: "sw-KE" },
};

/**
 * Robust Currency Formatter
 * Safely formats numbers, numeric strings, null, and undefined values without throwing errors.
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currencyCode: CurrencyCode | string = "NGN",
  options: {
    showDecimals?: boolean;
    symbolPosition?: "before" | "after";
  } = {}
): string => {
  const { showDecimals = false, symbolPosition = "before" } = options;

  // Safe parsing
  const numericAmount = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;

  // Currency lookup
  const code = (String(currencyCode).toUpperCase() as CurrencyCode) in CURRENCY_CONFIG
    ? (String(currencyCode).toUpperCase() as CurrencyCode)
    : "NGN";

  const config = CURRENCY_CONFIG[code];

  const formattedNumber = new Intl.NumberFormat(config.locale, {
    style: "decimal",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(safeAmount);

  return symbolPosition === "before"
    ? `${config.symbol}${formattedNumber}`
    : `${formattedNumber} ${config.symbol}`;
};

export default formatCurrency;
