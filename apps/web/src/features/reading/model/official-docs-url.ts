const OFFICIAL_DOCS_HOST = 'docs.aws.amazon.com';

export const toOfficialDocsUrl = (value: string): URL => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== OFFICIAL_DOCS_HOST) {
    throw new Error(`Only https://${OFFICIAL_DOCS_HOST} sources are allowed, got: ${value}`);
  }
  return url;
};
