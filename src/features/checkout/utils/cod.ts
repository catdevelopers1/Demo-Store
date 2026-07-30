/**
 * Calculates Cash on Delivery (COD) shipping charge in PKR based on store settings and order threshold
 */
export function calculateCodShippingPkr(
  effectiveSubtotalPkr: number,
  settings: { codShippingBasePkr: number; freeShippingThresholdPkr: number }
): number {
  if (
    effectiveSubtotalPkr >= settings.freeShippingThresholdPkr &&
    effectiveSubtotalPkr > 0
  ) {
    return 0;
  }
  return settings.codShippingBasePkr;
}

/**
 * Generates an executive Pakistani Order Number (e.g. "#PK-10482")
 */
export function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `#PK-${num}`;
}

/**
 * Evaluates initial order status. Orders exceeding the high-value PKR threshold flag as PENDING_VERIFICATION
 * requiring explicit SMS/WhatsApp customer confirmation before dispatch.
 */
export function evaluateOrderInitialStatus(
  totalPkr: number,
  highValueThresholdPkr = 25000
): 'PENDING_VERIFICATION' | 'CONFIRMED' {
  if (totalPkr > highValueThresholdPkr) {
    return 'PENDING_VERIFICATION';
  }
  return 'CONFIRMED';
}
