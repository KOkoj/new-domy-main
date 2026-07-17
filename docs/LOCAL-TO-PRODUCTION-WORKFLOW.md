# Local to production workflow

The official site follows this path:

`local branch -> GitHub pull request -> KOkoj/new-domy-main master -> existing Vercel production`

## Start a change

```powershell
git fetch origin master
git switch -c change/<short-name> origin/master
```

If the working tree already contains changes, save them on a safety branch
before switching bases.

## Validate

```powershell
npm test
npm run type-check
npm run check:encoding
npm run build
```

For property changes also verify:

- property count;
- unique slugs;
- local image paths;
- original source URL;
- availability status.

## Publish safely

```powershell
git push -u origin change/<short-name>
```

Open a pull request into `master`. The production deployment must be triggered
by merging the reviewed pull request through the GitHub/Vercel connection
configured by IT.

Do not deploy the local directory directly to a different Vercel project.

## Current recovery branches

- `local-recovery-20260717`: complete local snapshot before canonical sync.
- `integrate-local-20260717`: canonical `master` plus the reviewed local
  property inventory, assets, import tooling, and Venzone sold status.
