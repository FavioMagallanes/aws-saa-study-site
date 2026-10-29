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

describe('exam guide structure', () => {
  it('has domain weights that add up to 100 %', () => {
    expect(examGuide.domains.reduce((total, domain) => total + domain.weight, 0)).toBe(100);
  });

  it('assigns every task to a declared domain', () => {
    const domainIds = new Set(examGuide.domains.map((domain) => String(domain.id)));
    const orphans = examGuide.tasks.filter((task) => !domainIds.has(task.id.split('.')[0] ?? ''));
    expect(orphans).toEqual([]);
  });

  it('keeps full task titles instead of line-wrapped fragments', () => {
    const dangling = examGuide.tasks.filter((task) =>
      /\b(a|de|o|y|e|con|en|para|que)$/.test(task.title),
    );
    expect(dangling).toEqual([]);
  });
});
