import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

const matches = (received: string, expected: string): boolean => {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const requireWriteKey =
  (writeKey: string): RequestHandler =>
  (req, res, next) => {
    const received = req.header('x-write-key');
    if (received === undefined || !matches(received, writeKey)) {
      res.status(401).json({ error: 'invalid_write_key' });
      return;
    }
    next();
  };
