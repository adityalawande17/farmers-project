export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  if (month >= 5 && month <= 9) return `Kharif ${year}`;
  if (month >= 10) return `Rabi ${year + 1}`;
  if (month <= 2) return `Rabi ${year}`;
  return `Zaid ${year}`;
}
