export const DEFAULT_TRANSITION = "06-30";

export function getTransitionDate(): string {
  const env = process.env.PBB_TAX_YEAR_TRANSITION;
  if (!env) return DEFAULT_TRANSITION;
  if (!/^\d{2}-\d{2}$/.test(env)) {
    console.warn(
      `[pbb-tax-year] Invalid PBB_TAX_YEAR_TRANSITION "${env}", falling back to "${DEFAULT_TRANSITION}"`,
    );
    return DEFAULT_TRANSITION;
  }
  return env;
}

export function getCurrentTaxYear(): number {
  const now = new Date();
  const transition = getTransitionDate();
  const currentMMDD = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const taxYear =
    currentMMDD < transition ? now.getFullYear() - 1 : now.getFullYear();
  return taxYear;
}

const YEAR_OPTIONS_RANGE = 7;
const YEAR_OPTIONS_OFFSET = 3;

export function getYearOptions(baseYear?: number): number[] {
  const year = baseYear ?? getCurrentTaxYear();
  return Array.from(
    { length: YEAR_OPTIONS_RANGE },
    (_, i) => year - YEAR_OPTIONS_OFFSET + i,
  );
}

export function getTaxYearFromDate(date: Date): number {
  const transition = getTransitionDate();
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return mmdd < transition ? date.getFullYear() - 1 : date.getFullYear();
}
