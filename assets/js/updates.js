const owner = "DR-GRIEZEL";
const repo = "dr-griezel.github.io";
const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`;

const statusEl = document.getElementById("updates-status");
const listEl = document.getElementById("updates-list");

const setStatus = (message) => {
  if (statusEl) {
    statusEl.textContent = message;
  }
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const renderCommits = (commits) => {
  if (!listEl) return;
  listEl.innerHTML = "";

  commits.forEach((commit) => {
    const item = document.createElement("li");
    item.className = "updates-item";

    const link = document.createElement("a");
    link.href = commit.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = commit.commit?.message?.split("\n")[0] || "Untitled commit";

    const meta = document.createElement("div");
    meta.className = "updates-meta";

    const author = commit.commit?.author?.name || commit.author?.login || "Unknown author";
    const date = formatDate(commit.commit?.author?.date);
    const sha = commit.sha ? commit.sha.slice(0, 7) : "";

    meta.textContent = `${author} · ${date}${sha ? ` · ${sha}` : ""}`;

    item.append(link, meta);
    listEl.appendChild(item);
  });
};

const loadCommits = async () => {
  setStatus("Loading updates…");
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) {
      setStatus("No updates available yet.");
      return;
    }

    renderCommits(commits);
    setStatus("");
  } catch (error) {
    setStatus("Unable to load updates right now.");
  }
};

if (statusEl && listEl) {
  loadCommits();
}
