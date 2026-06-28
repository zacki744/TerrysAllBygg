export function formatPrice(price: number): string {
  return price % 1 === 0
    ? price.toLocaleString("sv-SE") + " kr"
    : price.toLocaleString("sv-SE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " kr";
}