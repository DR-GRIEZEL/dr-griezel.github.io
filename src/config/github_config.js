const owner = 'DR-GRIEZEL';
const repo = 'dr-griezel.github.io';
const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`;

const githubConfig = {
  owner,
  repo,
  commitsUrl,
};

export { commitsUrl, githubConfig, owner, repo };
