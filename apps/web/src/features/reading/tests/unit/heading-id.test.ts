import { describe, expect, it } from 'vitest';
import { headingIdFrom, slugifyHeading } from '../../model/heading-id';

describe('slugifyHeading', () => {
  it('removes accents and punctuation', () => {
    expect(slugifyHeading('¿Qué problema resuelve?')).toBe('que-problema-resuelve');
  });
});

describe('headingIdFrom', () => {
  it('returns no id when the heading is not plain text', () => {
    expect(headingIdFrom(['a', 'b'])).toBeUndefined();
  });
});
