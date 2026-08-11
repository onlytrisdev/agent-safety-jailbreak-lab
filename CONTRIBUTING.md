# Contributing

Thanks for helping improve Agent Safety Jailbreak Lab.

## Development setup

1. Fork or clone the repository.
2. Install dependencies with `npm ci`.
3. Run `npm run check` before making changes.
4. Use `npm run watch` while developing.
5. Press `F5` in VS Code to launch an Extension Development Host.

## Before submitting a change

Run:

```bash
npm run check
npm run compile
npm run package
```

Keep changes focused and document user-visible behavior in `CHANGELOG.md`. Do not commit `node_modules`, generated VSIX packages, private configuration, credentials, or downloaded instruction profiles.

## Pull requests

Describe:

- The problem being solved.
- The behavior before and after the change.
- How the change was tested.
- Any configuration files the change creates, updates, or removes.

Contributions must support authorized evaluation and must not introduce credential theft, stealth persistence, destructive actions, or unauthorized data collection.
