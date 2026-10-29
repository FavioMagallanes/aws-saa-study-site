import { describe, expect, it } from 'vitest';
import { checkCoverage } from '../../model/check-coverage';
import { examGuide } from '../../data/load-exam-guide';
import { loadPages } from '../../data/load-pages';

describe('exam guide coverage of the real content', () => {
  const pages = loadPages();
  const report = checkCoverage(pages, examGuide);

  it('has the 182 planned pages', () => {
    expect(pages).toHaveLength(182);
  });

  it('covers every bullet of the exam guide', () => {
    expect(report.uncoveredBullets).toEqual([]);
  });

  it('references only bullets that exist in the guide', () => {
    expect(report.unknownBullets).toEqual([]);
  });

  it('has a page for every in-scope service', () => {
    expect(report.servicesWithoutPage).toEqual([]);
  });

  it('has unique page ids', () => {
    expect(report.duplicatedPageIds).toEqual([]);
  });
});
