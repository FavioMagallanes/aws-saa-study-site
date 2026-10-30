import { describe, expect, it } from 'vitest';
import { safeReturnTo } from '../../model/return-to';

describe('safeReturnTo', () => {
  it.each([
    ['/', '/'],
    ['/lectura/amazon-sqs', '/lectura/amazon-sqs'],
    ['/glosario?q=vpc#a', '/glosario?q=vpc#a'],
  ])('keeps the same-origin path %s', (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });

  it.each([
    ['an absolute URL', 'https://evil.example/lectura/amazon-sqs'],
    ['a protocol-relative path', '//evil.example/lectura'],
    ['a backslash path browsers read as protocol-relative', '/\\evil.example'],
    ['a script URL', 'javascript:alert(1)'],
    ['a relative path', 'lectura/amazon-sqs'],
    ['a path with a tab', '/\t/evil.example'],
    ['an empty value', ''],
    ['the sign-in page itself', '/acceso'],
    ['the sign-in page with a query', '/acceso?returnTo=/'],
  ])('rejects %s', (_label, input) => {
    expect(safeReturnTo(input)).toBeUndefined();
  });

  it('rejects values that are not strings', () => {
    expect(safeReturnTo(42)).toBeUndefined();
    expect(safeReturnTo(undefined)).toBeUndefined();
    expect(safeReturnTo(['/'])).toBeUndefined();
  });
});
