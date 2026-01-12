# AGENTS.md

## Purpose
Keep the site stable and easy to change without breaking the framework.

## Safe-edit rules
1. **Edit content, not structure.**
   - ✅ Safe: change text, images, links, colors in `src/assets/css/` and `src/assets/img/`.
   - ✅ Safe: add new pages in `src/html/nav/`.
   - ⚠️ Be careful: files in `src/_layouts/`, `src/_includes/`, and `_config.yml`.
2. **One change at a time.** Make a small change, test, then move on.
3. **Never delete files unless you are sure they are unused.**
5. **Keep JS widgets modular.** Put new JS in `src/assets/js/` and import it from a page.

## Testing and coverage (required)
- **Every new function or change to a function/stateflow must include unit tests and coverage.**
- Add or update tests in `src/test/` and ensure coverage includes the new behavior.

## Quick checks
- Run formatting and linting before committing:
  - `npm run format`
  - `npm run lint`

## What to avoid
- Do not rename `src/_layouts/`, `src/_includes/`, or `src/assets/js/` files without updating all references.
- Do not change Jekyll front matter keys (`nav_label`, `nav_order`, `layout`) unless you know the impact.
