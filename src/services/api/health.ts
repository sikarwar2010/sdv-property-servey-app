import { env } from '@/src/config/env';
import axios from 'axios';

/** Base URL without the /v1 suffix (health lives at /health). */
export function apiOrigin(): string {
  return env.apiBaseUrl.replace(/\/v1\/?$/, '');
}

/** Ping the Go API liveness endpoint from the device/emulator. */
export async function pingApiHealth(): Promise<{ ok: boolean; message: string }> {
  const url = `${apiOrigin()}/health`;
  try {
    const res = await axios.get<{ status?: string }>(url, { timeout: 8_000 });
    if (res.data?.status === 'ok') {
      return { ok: true, message: `Connected (${url})` };
    }
    return { ok: false, message: `Unexpected response from ${url}` };
  } catch (err) {
    const hint = 'Start Go API: property-survey-backend\\scripts\\run.ps1. Emulator must use 10.0.2.2:8080.';
    const detail = err instanceof Error ? err.message : 'network error';
    return { ok: false, message: `Cannot reach ${url} — ${detail}. ${hint}` };
  }
}
