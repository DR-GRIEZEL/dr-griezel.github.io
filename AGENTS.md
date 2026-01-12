# AGENTS.md

## Purpose
Keep the site stable, modular and scalable without breaking the framework.

## Safe-edit rules
1. **Edit content, not structure.**
   - ✅ Safe: change text, images, links, colors in `src/assets/css/` and `src/assets/img/`.
   - ✅ Safe: add new pages in `src/html/nav/`, add blog pages to `src/.
   - ⚠️ Be careful: files in `src/_layouts/`, `src/_includes/`, and `_config.yml`.
2. **One change at a time.** Make a small change, test, then move on.
3. **Never delete files unless you are sure they are unused.**
4. **Keep JS widgets modular.** Put new JS in `src/assets/js/` and import it from a page.
5. **Public repo:** Do not place **any** sensitive information like API secrets in this workspace.

## Testing and coverage (required)
- **Keep coverage above 90%, add unit tests whenever it drops below this value. Focus primarily on auth pipeline.**
- **Every new function or change to a function/stateflow must include unit tests and coverage.**
- Add or update tests in `src/test/` and ensure coverage includes the new behavior.

## Quick checks
- Run formatting and linting before committing:
  - `npm run format`
  - `npm run lint`

## What to avoid
- Do not rename `src/_layouts/`, `src/_includes/`, or `src/assets/js/` files without updating all references.
- Do not change Jekyll front matter keys (`nav_label`, `nav_order`, `layout`) unless you know the impact.
