/**
 * Friendly error mapping for UI surfaces (toasts, banners, form helpers).
 *
 * Keeps every Toast / Banner from having to duplicate "is this a network
 * error?" branching. Use:
 *
 *   try { await mutation() } catch (err) {
 *     Toast.show(toUserMessage(err));
 *   }
 */
import { HttpError } from '@/src/services/api/client';
import { ZodError } from 'zod';

export function toUserMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.isNetwork) return 'No internet. Check your connection and try again.';
    if (err.isTimeout) return 'Request timed out. Server is slow — please retry.';
    if (err.status === 401) return 'Session expired. Please sign in again.';
    if (err.status === 403) return "You don't have permission for this action.";
    if (err.status === 404) return 'Not found.';
    if (err.status === 409) return 'Conflict — refresh and try again.';
    if (err.status === 422) return firstFieldError(err) ?? err.message;
    if (err.status >= 500) return 'Server is having trouble. Please try again in a moment.';
    return err.message || 'Request failed';
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return first?.message ?? 'Invalid input';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

/** Pull the first field-level error from an HttpError 422 details bag. */
function firstFieldError(err: HttpError): string | null {
  if (!err.details) return null;
  for (const [field, msgs] of Object.entries(err.details)) {
    if (msgs?.[0]) return `${humanize(field)}: ${msgs[0]}`;
  }
  return null;
}

function humanize(field: string): string {
  return field
    .replace(/[._-]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/** Map an HttpError's field errors onto react-hook-form via `setError`. */
export function applyFieldErrors<F extends { setError: (n: never, e: { message: string }) => void }>(
  err: unknown,
  form: F,
): boolean {
  if (!(err instanceof HttpError) || !err.details) return false;
  for (const [field, msgs] of Object.entries(err.details)) {
    if (msgs?.[0]) {
      // RHF accepts any string path; we cast through `never` to dodge the
      // generic constraint while keeping the public API typed.
      form.setError(field as never, { message: msgs[0] });
    }
  }
  return true;
}
