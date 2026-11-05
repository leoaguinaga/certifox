export { cn } from "cn"

/** Formatea un precio (en unidades, no céntimos). 0 → "Gratuito". */
export function formatPrice(amount: number, currency: string): string {
  if (amount <= 0) return "Gratuito";
  try {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
