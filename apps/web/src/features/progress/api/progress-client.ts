import {
  progressEntrySchema,
  progressResponseSchema,
  type ProgressEntry,
} from '@arquitecto/contracts/progress';

export type ProgressErrorKind = 'missing-key' | 'invalid-key' | 'unavailable' | 'failed';

export class ProgressRequestError extends Error {
  readonly kind: ProgressErrorKind;

  constructor(kind: ProgressErrorKind, message: string) {
    super(message);
    this.name = 'ProgressRequestError';
    this.kind = kind;
  }
}

const BASE_URL = '/api/progress';

const send = async (input: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch {
    throw new ProgressRequestError('unavailable', 'The progress service could not be reached');
  }
};

const assertOk = (response: Response): void => {
  if (response.ok) return;
  if (response.status === 401) {
    throw new ProgressRequestError('invalid-key', 'The write key was rejected');
  }
  throw new ProgressRequestError(
    'failed',
    `Progress request failed with ${String(response.status)}`,
  );
};

const parseJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    throw new ProgressRequestError('failed', 'The progress service returned an invalid response');
  }
};

export const fetchProgress = async (signal?: AbortSignal): Promise<ProgressEntry[]> => {
  const response = await send(BASE_URL, signal ? { signal } : {});
  assertOk(response);
  const parsed = progressResponseSchema.safeParse(await parseJson(response));
  if (!parsed.success) {
    throw new ProgressRequestError('failed', 'The progress service returned unexpected data');
  }
  return parsed.data.entries;
};

export const markPageRead = async (pageId: string, writeKey: string): Promise<ProgressEntry> => {
  const response = await send(`${BASE_URL}/${encodeURIComponent(pageId)}`, {
    method: 'PUT',
    headers: { 'x-write-key': writeKey },
  });
  assertOk(response);
  const parsed = progressEntrySchema.safeParse(await parseJson(response));
  if (!parsed.success) {
    throw new ProgressRequestError('failed', 'The progress service returned unexpected data');
  }
  return parsed.data;
};

export const markPageUnread = async (pageId: string, writeKey: string): Promise<void> => {
  const response = await send(`${BASE_URL}/${encodeURIComponent(pageId)}`, {
    method: 'DELETE',
    headers: { 'x-write-key': writeKey },
  });
  assertOk(response);
};
