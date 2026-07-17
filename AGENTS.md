# Repository workflow

## Canonical structure

- Canonical GitHub repository: `KOkoj/new-domy-main`
- Canonical production branch: `master`
- Local `origin` must point to `https://github.com/KOkoj/new-domy-main.git`
- `legacy-lucacr90` is read-only historical context. Do not push production
  changes there.
- Do not change Vercel projects, domains, aliases, GitHub connections, branch
  protection, or production environment variables unless the user explicitly
  requests that exact infrastructure change.

## Required workflow for every site change

1. Fetch `origin/master`.
2. Start from the current `origin/master`, never from a stale local `master`.
3. Preserve unrelated user changes in a safety branch or commit before
   integrating.
4. Make the requested change on a dedicated branch.
5. Run, at minimum:
   - `npm test`
   - `npm run type-check`
   - `npm run check:encoding`
   - `npm run build`
6. Push the dedicated branch to `origin`.
7. Merge through a reviewed pull request into `master`.
8. Let the existing GitHub-to-Vercel production integration deploy `master`.
   Do not create an unrelated direct Vercel deployment.
9. After deployment, verify the official domain and its public API.

## Property data rules

- `data/local-properties.json` is the bundled property inventory.
- Every slug must be unique.
- Property images referenced in the inventory must exist under
  `public/uploads/properties/<slug>/`.
- New import source material belongs under `data/import/properties/<slug>/`.
- Source URLs must point to the original listing.
- When a verified source listing is unavailable, set the property status to
  `sold` or `reserved` as appropriate; cards and detail galleries already
  render the localized overlay.
- Production database synchronization must be performed through the canonical
  project's existing admin/data workflow. Do not replace production data with
  an older local database snapshot.

## Safety

- Never force-push `master`.
- Never reset or discard a dirty worktree without first preserving it.
- Never roll production back merely to recover missing property data.
- Keep the canonical IT security, email, admin, PDF, RLS, domain, and Vercel
  changes unless a later task explicitly changes them.
