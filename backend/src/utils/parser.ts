/**
 * Parse string nominal ke number.
 * Mendukung:
 * - 25k, 25K -> 25000
 * - 25rb, 25 rb -> 25000
 * - 1.5m, 1,5m, 1.5jt, 1,5jt -> 1500000
 * - 50000, 50.000 -> 50000
 */
export function parseNominal(input: string): number | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase().replace(/\s+/g, '');

  // Check suffix
  // Suffix: k / rb (ribu = * 1000)
  const ribuMatch = clean.match(/^([0-9]+(?:[.,][0-9]+)?)(k|rb)$/);
  if (ribuMatch) {
    const val = parseFloat(ribuMatch[1].replace(',', '.'));
    return Math.round(val * 1000);
  }

  // Suffix: m / jt (juta = * 1000000)
  const jutaMatch = clean.match(/^([0-9]+(?:[.,][0-9]+)?)(m|jt)$/);
  if (jutaMatch) {
    const val = parseFloat(jutaMatch[1].replace(',', '.'));
    return Math.round(val * 1000000);
  }

  // Suffix: b / mly (milyar = * 1000000000)
  const milyarMatch = clean.match(/^([0-9]+(?:[.,][0-9]+)?)(b|mly)$/);
  if (milyarMatch) {
    const val = parseFloat(milyarMatch[1].replace(',', '.'));
    return Math.round(val * 1000000000);
  }

  // Pure number with possible thousand separators e.g. 50.000 or 50,000
  // If format is like 50.000 (three digits after dot), remove dots
  if (/^[0-9]{1,3}(?:[.,][0-9]{3})+$/.test(clean)) {
    const sanitized = clean.replace(/[.,]/g, '');
    const num = Number(sanitized);
    return isNaN(num) ? null : num;
  }

  // Standard float or int e.g. 25000 or 25000.50
  const normalized = clean.replace(',', '.');
  const num = Number(normalized);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Format number to Indonesian Rupiah currency format
 * e.g. 25000 -> "Rp 25.000"
 */
export function formatIDR(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

