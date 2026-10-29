export const pnfNameOf = (p: any): string => (typeof p === 'string' ? p : p?.pnf?.name ?? p?.name ?? '')
