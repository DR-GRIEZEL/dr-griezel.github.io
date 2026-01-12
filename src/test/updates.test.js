import { describe, expect, it } from 'vitest';
import {
  formatDate,
  getCommitAuthorName,
  getCommitMetaText,
  getCommitTitle,
  getTopContributor,
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

  it('returns a top contributor summary', () => {
    const commits = [
      { commit: { author: { name: 'Avery' } } },
      { commit: { author: { name: 'Avery' } } },
      { author: { login: 'octo' } },
    ];
    expect(getTopContributor(commits)).toEqual({ name: 'Avery', count: 2 });
  });

  it('returns null when there are no commits', () => {
    expect(getTopContributor([])).toBeNull();
  });
});
