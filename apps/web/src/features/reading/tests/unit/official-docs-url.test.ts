import { describe, expect, it } from 'vitest';
import { toOfficialDocsUrl } from '../../model/official-docs-url';

describe('toOfficialDocsUrl', () => {
  it('accepts an https docs.aws.amazon.com URL', () => {
    const url =
      'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html';
    expect(toOfficialDocsUrl(url).href).toBe(url);
  });

  it.each([
    'http://docs.aws.amazon.com/vpc/',
    'https://aws.amazon.com/vpc/',
    'https://docs.aws.amazon.com.evil.example/vpc/',
    'javascript:alert(1)',
  ])('rejects %s', (url) => {
    expect(() => toOfficialDocsUrl(url)).toThrow();
  });
});
