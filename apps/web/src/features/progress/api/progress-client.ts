import {
  progressEntrySchema,
  progressResponseSchema,
  type ProgressEntry,
} from '@arquitecto/contracts/progress';

export type ProgressErrorKind = 'unauthorized' | 'unavailable' | 'failed';

export class ProgressRequestError extends Error {
  readonly kind: ProgressErrorKind;

  constructor(kind: ProgressErrorKind, message: string) {
    super(message);
    this.name = 'ProgressRequestError';
    this.kind = kind;
  }
}

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ProgressRequestError && error.kind === 'unauthorized';

const BASE_URL = '/api/progress';

const authorization = (accessToken: string) => ({ authorization: `Bearer ${accessToken}` });

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
    throw new ProgressRequestError('unauthorized', 'The access token was rejected');
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

export const fetchProgress = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProgressEntry[]> => {
  const headers = authorization(accessToken);
  const response = await send(BASE_URL, signal ? { headers, signal } : { headers });
  assertOk(response);
  const parsed = progressResponseSchema.safeParse(await parseJson(response));
  if (!parsed.success) {
    throw new ProgressRequestError('failed', 'The progress service returned unexpected data');
  }
  return parsed.data.entries;
};

export const markPageRead = async (pageId: string, accessToken: string): Promise<ProgressEntry> => {
  const response = await send(`${BASE_URL}/${encodeURIComponent(pageId)}`, {
    method: 'PUT',
    headers: authorization(accessToken),
  });
  assertOk(response);
  const parsed = progressEntrySchema.safeParse(await parseJson(response));
  if (!parsed.success) {
    throw new ProgressRequestError('failed', 'The progress service returned unexpected data');
  }
  return parsed.data;
};

export const markPageUnread = async (pageId: string, accessToken: string): Promise<void> => {
  const response = await send(`${BASE_URL}/${encodeURIComponent(pageId)}`, {
    method: 'DELETE',
    headers: authorization(accessToken),
  });
  assertOk(response);
};
