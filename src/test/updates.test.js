import { describe, expect, it, vi } from 'vitest';
import {
  formatDate,
  getCommitAuthorName,
  getCommitMetaText,
  getCommitTitle,
  getContributorsByCount,
  withTimeout,
} from '../assets/js/updates.js';

describe('updates helpers', () => {
  it('formats an iso date into a short label', () => {
    expect(formatDate('2024-01-02T12:00:00Z')).toBe('Jan 02, 2024');
  });

  it('returns empty string for invalid date input', () => {
    expect(formatDate('not-a-date')).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('uses the first line of the commit message', () => {
    const commit = { commit: { message: 'Fix: update nav\n\nMore details' } };
    expect(getCommitTitle(commit)).toBe('Fix: update nav');
  });

  it('falls back to an untitled commit', () => {
    expect(getCommitTitle({})).toBe('Untitled commit');
  });

  it('builds meta text with author, date, and sha', () => {
    const commit = {
      sha: 'abcdef123456',
      commit: { author: { name: 'Sam', date: '2024-01-02T12:00:00Z' } },
    };
    expect(getCommitMetaText(commit)).toBe('Sam · Jan 02, 2024 · abcdef1');
  });

  it('handles missing date and sha', () => {
    const commit = { commit: { author: { name: 'Alex' } } };
    expect(getCommitMetaText(commit)).toBe('Alex');
  });

  it('falls back to unknown author', () => {
    expect(getCommitMetaText({})).toBe('Unknown author');
  });

  it('picks the author name from commit metadata', () => {
    const commit = { commit: { author: { name: 'Casey' } } };
    expect(getCommitAuthorName(commit)).toBe('Casey');
  });

  it('falls back to the API author login', () => {
    const commit = { author: { login: 'octocat' } };
    expect(getCommitAuthorName(commit)).toBe('octocat');
  });

  it('returns contributors sorted by count', () => {
    const commits = [
      { commit: { author: { name: 'Avery' } } },
      { commit: { author: { name: 'Bree' } } },
      { commit: { author: { name: 'Avery' } } },
      { author: { login: 'octo' } },
    ];
    expect(getContributorsByCount(commits)).toEqual([
      { name: 'Avery', count: 2 },
      { name: 'Bree', count: 1 },
      { name: 'octo', count: 1 },
    ]);
  });

  it('returns an empty list when there are no commits', () => {
    expect(getContributorsByCount([])).toEqual([]);
  });

  it('resolves when a promise settles before timeout', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 25);
    expect(result).toBe('ok');
  });

  it('rejects when a promise exceeds the timeout', async () => {
    vi.useFakeTimers();
    const slowPromise = new Promise(() => {});
    const pending = withTimeout(slowPromise, 10);
    const expectation = expect(pending).rejects.toThrow('Request timed out');

    await vi.advanceTimersByTimeAsync(20);

    await expectation;
    vi.useRealTimers();
  });
});
