# Changelog

All notable changes to this project are documented in this file.

## [1.2.0] - 2026-08-20

### Added

- Bundled local rule profiles in `resources/rules/` (`bypass_v1.md` and `bypass_v2.md`).
- Offline activation support without requiring remote URL fetching.

### Changed

- Updated rule loader in `src/extension.ts` to read directly from local extension package.
- Cleaned up repository structure and standardized rule file naming conventions.
- Removed remote network fetch and obfuscated URL decoding logic.

## [1.1.0] - 2026-08-11

### Added

- Global Claude Code Output Style integration.
- Documented support for Antigravity (Gemini 3.1 Pro and Claude), Kiro (Claude), and Claude Code with compatible third-party APIs.
- Cross-platform Claude configuration discovery through the user home directory.
- Support for `CLAUDE_CONFIG_DIR`.
- Preservation and restoration of the previously selected Claude output style.
- Public repository documentation and reproducible packaging scripts.

### Changed

- Rebranded the extension as Agent Safety Jailbreak Lab.
- Updated the extension identifier to `onlytrisdev.agent-safety-jailbreak-lab` and added public repository metadata.
- Isolated Claude configuration in `output-styles/onlytris.md`.

### Removed

- Direct writes to the user's global `CLAUDE.md`.
- Unsupported writes to `~/.config/claude/config.json`.

## [1.0.0] - 2026-08-11

- Initial local release.
