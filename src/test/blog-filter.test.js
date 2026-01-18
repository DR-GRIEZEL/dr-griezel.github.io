import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyBlogFilter, initBlogFilters } from '../assets/js/blog-filter.js';

const createCard = (category) => ({
  dataset: category ? { blogCategory: category } : {},
  hidden: false,
});

describe('applyBlogFilter', () => {
  it('shows every card when the "all" filter is active', () => {
    const cards = [createCard('labs'), createCard('markets')];

    applyBlogFilter(cards, 'all');

    cards.forEach((card) => {
      expect(card.hidden).toBe(false);
    });
  });

  it('hides cards that do not match the chosen category', () => {
    const cards = [createCard('labs'), createCard('markets')];

    applyBlogFilter(cards, 'Labs');

    expect(cards[0].hidden).toBe(false);
    expect(cards[1].hidden).toBe(true);
  });

  it('treats missing category metadata as "general"', () => {
    const generalCard = createCard(null);
    const otherCard = createCard('systems');

    applyBlogFilter([generalCard, otherCard], 'general');

    expect(generalCard.hidden).toBe(false);
    expect(otherCard.hidden).toBe(true);
  });
});

describe('initBlogFilters', () => {
  const createButton = (filter) => {
    const handlers = {};
    return {
      dataset: { blogFilter: filter },
      classList: {
        toggle: vi.fn(),
      },
      setAttribute: vi.fn(),
      addEventListener: (event, handler) => {
        handlers[event] = handler;
      },
      fire(event = 'click') {
        if (handlers[event]) handlers[event]();
      },
    };
  };

  afterEach(() => {
    delete globalThis.document;
  });

  it('initializes filter buttons and hides non-matching cards when clicked', () => {
    const buttons = [createButton('all'), createButton('systems')];
    const cards = [createCard('systems'), createCard('models')];
    const stubDocument = {
      readyState: 'complete',
      querySelectorAll: (selector) => {
        if (selector === '[data-blog-filter]') return buttons;
        if (selector === '[data-blog-card]') return cards;
        return [];
      },
    };

    vi.stubGlobal('document', stubDocument);

    initBlogFilters();

    expect(cards[0].hidden).toBe(false);
    expect(cards[1].hidden).toBe(false);

    buttons[1].fire('click');

    expect(cards[0].hidden).toBe(false);
    expect(cards[1].hidden).toBe(true);
    expect(buttons[1].setAttribute).toHaveBeenCalledWith('aria-pressed', 'true');
  });
});

describe('blog filter bootstrap', () => {
  afterEach(() => {
    delete globalThis.document;
    vi.resetModules();
  });

  it('registers a DOMContentLoaded handler when the document is loading', async () => {
    vi.resetModules();
    const addEventListener = vi.fn((event, handler) => {
      if (event === 'DOMContentLoaded') handler();
    });

    vi.stubGlobal('document', {
      readyState: 'loading',
      addEventListener,
      querySelectorAll: () => [],
    });

    await import('../assets/js/blog-filter.js');

    expect(addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
  });

  it('bootstraps immediately when the document is ready', async () => {
    vi.resetModules();
    const querySelectorAll = vi.fn(() => []);

    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll,
    });

    await import('../assets/js/blog-filter.js');

    expect(querySelectorAll).toHaveBeenCalledWith('[data-blog-filter]');
  });
});
