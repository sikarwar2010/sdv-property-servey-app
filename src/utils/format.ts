/** sqft → sqm */
export function sqftToSqm(sqft: number): number {
  return Math.round(sqft * 0.092903 * 10) / 10;
}

/** sqft → sqm as fixed decimal string (matches common survey paper forms). */
export function sqftToSqmDetailed(sqft: number): string {
  if (!Number.isFinite(sqft) || sqft <= 0) return '0.0000';
  return (sqft * 0.09290304).toFixed(4);
}

/** sqm → sqft */
export function sqmToSqft(sqm: number): number {
  return Math.round(sqm * 10.7639);
}

/** Format Indian-style mobile, e.g. 98215 47821 */
export function formatMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** Validate Indian mobile (10 digits starting 6-9) */
export function isValidMobile(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(raw.replace(/\D/g, ''));
}

/** Validate 6-digit pin code */
export function isValidPin(raw: string): boolean {
  return /^\d{6}$/.test(raw.replace(/\D/g, ''));
}

/** Time-ago formatter (e.g. "2 min ago", "3 hr ago") */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? 'Yesterday' : `${day} d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Format time like 9:41 AM */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format date like 10 May */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Greeting based on hour */
export function timeOfDayGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

/** Indian thousands grouping (5,100 instead of 5,100) */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

/** Generate short UUID-ish id */
export function makeId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
