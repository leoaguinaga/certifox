/**
 * Enmascara el documento de identidad (Ley 29733 / RNF-03): solo los últimos 4 dígitos.
 */
export function maskDocumentNumber(docNumber?: string | null): string {
  if (!docNumber || !docNumber.trim()) return "No registrado";
  const trimmed = docNumber.trim();
  return `•••• ${trimmed.slice(-4)}`;
}
