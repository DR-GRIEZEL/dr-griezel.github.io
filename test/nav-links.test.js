import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const navDir = path.join('html', 'nav');

const parseFrontMatter = (content) => {
  const match = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) return {};
  const block = match[1];
  const getField = (key) => {
    const line = block.split(/\r?\n/).find((row) => row.trim().startsWith(`${key}:`));
    if (!line) return undefined;
    const value = line.split(':').slice(1).join(':').trim();
    return value.replace(/^"|"$/g, '');
  };
  return {
    permalink: getField('permalink'),
    navOrder: getField('nav_order'),
  };
};

describe('navbar page metadata', () => {
  it('defines permalinks and nav ordering for each nav page', () => {
    const files = fs.readdirSync(navDir).filter((name) => name.endsWith('.html'));
    expect(files.length).toBeGreaterThan(0);

    const permalinks = new Set();
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(navDir, file), 'utf8');
      const { permalink, navOrder } = parseFrontMatter(content);

      expect(permalink, `${file} missing permalink`).toBeTruthy();
      expect(navOrder, `${file} missing nav_order`).toBeTruthy();
      expect(permalink.startsWith('/'), `${file} permalink must start with /`).toBe(true);
      if (permalink !== '/') {
        expect(permalink.endsWith('/'), `${file} permalink should end with /`).toBe(true);
      }

      expect(permalinks.has(permalink)).toBe(false);
      permalinks.add(permalink);
    });
  });
});
