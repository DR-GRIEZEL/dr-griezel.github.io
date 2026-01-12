import { owner, repo, url } from '../../config/github_config.js';

const commitsUrl = url || `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`;

const statusEl = typeof document === 'undefined' ? null : document.getElementById('updates-status');
const listEl = typeof document === 'undefined' ? null : document.getElementById('updates-list');
const leaderboardEl =
  typeof document === 'undefined' ? null : document.getElementById('updates-leaderboard');

const setStatus = (message, target = statusEl) => {
  if (target) {
    target.textContent = message;
  }
};

const setLeaderboard = (message, target = leaderboardEl) => {
  if (target) {
    target.textContent = message;
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

const getTopContributor = (commits) => {
  if (!Array.isArray(commits) || commits.length === 0) return null;
  const counts = new Map();

  commits.forEach((commit) => {
    const author = getCommitAuthorName(commit);
    counts.set(author, (counts.get(author) || 0) + 1);
  });

  let topContributor = null;

  counts.forEach((count, name) => {
    if (!topContributor || count > topContributor.count) {
      topContributor = { name, count };
    }
  });

  return topContributor;
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

const renderLeaderboard = (commits, target = leaderboardEl) => {
  if (!target) return;
  const topContributor = getTopContributor(commits);

  if (!topContributor) {
    target.textContent = '';
    return;
  }

  target.textContent = `Most contributions: ${topContributor.name}: ${topContributor.count}`;
};

const loadCommits = async () => {
  setStatus('Loading updates…');
  setLeaderboard('');
  try {
    const res = await fetch(commitsUrl, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) {
      setStatus('No updates available yet.');
      return;
    }

    renderCommits(commits);
    renderLeaderboard(commits);
    setStatus('');
  } catch {
    setStatus('Unable to load updates right now.');
    setLeaderboard('');
  }
};

if (statusEl && listEl) {
  loadCommits();
}

export { formatDate, getCommitAuthorName, getCommitMetaText, getCommitTitle, getTopContributor };
