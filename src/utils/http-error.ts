/**
 * HTTP/axios error helpers.
 *
 * The backend returns error detail in two shapes: a plain string, or a
 * structured object (e.g. ``{ reason, message }`` for a 412
 * PRECONDITION_FAILED). Plain interpolation would print
 * ``[object Object]`` for the dict case, so :func:`extractErrorMessage`
 * drills into ``.reason`` / ``.message`` when present and falls back to
 * ``err.message`` so a toast is always readable.
 */

/** Turn an axios-style error into a human-readable string. */
export function extractErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object') {
    if (typeof detail.reason === 'string') return detail.reason
    if (typeof detail.message === 'string') return detail.message
  }
  return err?.message || 'Unknown error'
}
