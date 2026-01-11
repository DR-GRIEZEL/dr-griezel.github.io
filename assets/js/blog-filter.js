const DEFAULT_FILTER = 'all';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export const applyBlogFilter = (cards, filter = DEFAULT_FILTER) => {
  const normalizedFilter = normalize(filter) || DEFAULT_FILTER;
  cards.forEach((card) => {
    const category = normalize(card?.dataset?.blogCategory) || 'general';
    const matches = normalizedFilter === DEFAULT_FILTER || category === normalizedFilter;
    if (card) {
      card.hidden = !matches;
    }
  });
};

const updateButtonStates = (buttons, activeFilter) => {
  const normalizedActive = normalize(activeFilter) || DEFAULT_FILTER;
  buttons.forEach((button) => {
    const buttonFilter = normalize(button?.dataset?.blogFilter) || DEFAULT_FILTER;
    const isActive = buttonFilter === normalizedActive;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

export const initBlogFilters = () => {
  if (typeof document === 'undefined') return;

  const buttons = Array.from(document.querySelectorAll('[data-blog-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-blog-card]'));

  if (!buttons.length || !cards.length) return;

  const applyFilter = (selectedFilter) => {
    const target = selectedFilter ?? DEFAULT_FILTER;
    applyBlogFilter(cards, target);
    updateButtonStates(buttons, target);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.blogFilter);
    });
  });

  applyFilter(DEFAULT_FILTER);
};

const bootstrapBlogFilters = () => {
  initBlogFilters();
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapBlogFilters);
  } else {
    bootstrapBlogFilters();
  }
}
