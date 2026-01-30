import { commitsUrl, owner, repo } from '../../config/github_config.js';

const statusEl = typeof document === 'undefined' ? null : document.getElementById('updates-status');
const listEl = typeof document === 'undefined' ? null : document.getElementById('updates-list');
const leaderboardEl =
  typeof document === 'undefined' ? null : document.getElementById('updates-leaderboard');

const contributorsUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`;

const setStatus = (message, target = statusEl) => {
  if (target) {
    target.textContent = message;
  }
};

const setLeaderboard = (message, target = leaderboardEl) => {
  if (target) {
    if (message) {
      target.textContent = message;
    } else {
      target.textContent = '';
      target.innerHTML = '';
    }
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
};

const getCommitTitle = (commit) => {
  return commit?.commit?.message?.split('\n')[0] || 'Untitled commit';
};

const getCommitAuthorName = (commit) => {
  return commit?.commit?.author?.name || commit?.author?.login || 'Unknown author';
};

const getCommitMetaText = (commit) => {
  const author = getCommitAuthorName(commit);
  const date = formatDate(commit?.commit?.author?.date);
  const sha = commit?.sha ? commit.sha.slice(0, 7) : '';
  const segments = [author];

  if (date) segments.push(date);
  if (sha) segments.push(sha);

  return segments.join(' · ');
};

const getContributorsByCount = (commits) => {
  if (!Array.isArray(commits) || commits.length === 0) return [];
  const counts = new Map();

  commits.forEach((commit) => {
    const author = getCommitAuthorName(commit);
    counts.set(author, (counts.get(author) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const getContributorName = (contributor) => {
  return contributor?.login || contributor?.name || 'Unknown contributor';
};

const getContributorsFromApi = (contributors) => {
  if (!Array.isArray(contributors) || contributors.length === 0) return [];
  return contributors
    .map((contributor) => ({
      name: getContributorName(contributor),
      count: contributor?.contributions ?? 0,
    }))
    .filter(({ name, count }) => name && count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const renderCommits = (commits, target = listEl) => {
  if (!target) return;
  target.innerHTML = '';

  commits.forEach((commit) => {
    const item = document.createElement('li');
    item.className = 'updates-item';

    const link = document.createElement('a');
    link.href = commit.html_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = getCommitTitle(commit);

    const meta = document.createElement('div');
    meta.className = 'updates-meta';
    meta.textContent = getCommitMetaText(commit);

    item.append(link, meta);
    target.appendChild(item);
  });
};

const renderLeaderboard = (contributors, target = leaderboardEl) => {
  if (!target) return;
  const list = Array.isArray(contributors) ? contributors : [];

  if (!list.length) {
    target.innerHTML = '';
    return;
  }

  target.innerHTML = '';
  list.forEach(({ name, count }) => {
    const item = document.createElement('li');
    item.textContent = `${name} · ${count}`;
    target.appendChild(item);
  });
};

export const withTimeout = (promise, timeoutMs, timeoutMessage = 'Request timed out') => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const loadCommits = async () => {
  setStatus('Loading updates…');
  setLeaderboard('');
  try {
    const res = await withTimeout(
      fetch(commitsUrl, {
        headers: { Accept: 'application/vnd.github+json' },
      }),
      8000,
    );

    const contributorsResponse = await withTimeout(
      fetch(contributorsUrl, {
        headers: { Accept: 'application/vnd.github+json' },
      }),
      8000,
    ).catch(() => null);

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) {
      setStatus('No updates available yet.');
      return;
    }

    renderCommits(commits);
    if (contributorsResponse && contributorsResponse.ok) {
      const contributors = await contributorsResponse.json();
      renderLeaderboard(getContributorsFromApi(contributors));
    } else {
      renderLeaderboard(getContributorsByCount(commits));
    }
    setStatus('');
  } catch {
    setStatus('Unable to load updates right now.');
    setLeaderboard('');
  }
};

if (statusEl && listEl) {
  loadCommits();
}

export {
  formatDate,
  getContributorName,
  getContributorsFromApi,
  getCommitAuthorName,
  getCommitMetaText,
  getCommitTitle,
  getContributorsByCount,
};
