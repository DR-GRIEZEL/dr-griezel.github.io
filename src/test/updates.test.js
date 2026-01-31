import { describe, expect, it, vi } from 'vitest';
import {
  buildCommitsUrl,
  buildContributorsUrl,
  formatDate,
  getGithubConfig,
  getContributorName,
  getContributorsFromApi,
  getCommitAuthorName,
  getCommitMetaText,
  getCommitTitle,
  getContributorsByCount,
  normalizeGithubConfig,
  withTimeout,
} from '../assets/js/updates.js';

describe('updates helpers', () => {
  it('formats an iso date into a short label', () => {
    expect(formatDate('2024-01-02T12:00:00Z')).toBe('Jan 02, 2024');
  });

  it('builds GitHub API endpoints', () => {
    expect(buildCommitsUrl('octo', 'repo')).toBe(
      'https://api.github.com/repos/octo/repo/commits?per_page=20',
    );
    expect(buildContributorsUrl('octo', 'repo')).toBe(
      'https://api.github.com/repos/octo/repo/contributors?per_page=100',
    );
  });

  it('normalizes GitHub config with defaults', () => {
    const normalized = normalizeGithubConfig({});
    expect(normalized.owner).toBe('DR-GRIEZEL');
    expect(normalized.repo).toBe('dr-griezel.github.io');
    expect(normalized.commitsUrl).toBe(
      'https://api.github.com/repos/DR-GRIEZEL/dr-griezel.github.io/commits?per_page=20',
    );
  });

  it('normalizes GitHub config with explicit values', () => {
    const normalized = normalizeGithubConfig({
      owner: 'octo',
      repo: 'repo',
      commitsUrl: 'https://example.test/commits',
    });
    expect(normalized).toEqual({
      owner: 'octo',
      repo: 'repo',
      commitsUrl: 'https://example.test/commits',
    });
  });

  it('loads GitHub config from a loader', async () => {
    const loader = () =>
      Promise.resolve({ githubConfig: { owner: 'octo', repo: 'repo', commitsUrl: 'custom' } });
    await expect(getGithubConfig(loader)).resolves.toEqual({
      owner: 'octo',
      repo: 'repo',
      commitsUrl: 'custom',
    });
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

  it('reads contributor names from the API response', () => {
    expect(getContributorName({ login: 'octocat' })).toBe('octocat');
    expect(getContributorName({ name: 'Ada' })).toBe('Ada');
    expect(getContributorName({})).toBe('Unknown contributor');
  });

  it('maps contributor API payloads to leaderboard entries', () => {
    const contributors = [
      { login: 'Ada', contributions: 5 },
      { login: 'Bree', contributions: 3 },
      { login: 'Zero', contributions: 0 },
    ];
    expect(getContributorsFromApi(contributors)).toEqual([
      { name: 'Ada', count: 5 },
      { name: 'Bree', count: 3 },
    ]);
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
