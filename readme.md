# Agent Safety Jailbreak Lab

Agent Safety Jailbreak Lab is a VS Code-compatible extension for cross-model instruction and guardrail evaluation. It synchronizes a selected research profile to supported AI coding environments from one sidebar.

> [!IMPORTANT]
> This project is intended for authorized research, prompt-behavior evaluation, and local experimentation. It does not disable provider-enforced safeguards, access controls, or platform policies.

## Features

- Synchronizes instruction profiles to supported local AI coding assistants.
- Installs a global Claude Code Output Style without overwriting `CLAUDE.md`.
- Preserves existing Claude Code settings and restores the previous output style on reset.
- Supports Windows, macOS, and Linux through user-relative configuration paths.
- Respects `CLAUDE_CONFIG_DIR` when it is configured.
- Displays file size, line count, and last synchronization time.

## Supported environments

- **Antigravity:** Gemini 3.1 Pro and Claude.
- **Kiro:** Claude.
- **Claude Code:** including installations configured to use compatible third-party API providers.

## Configuration targets

| Target | User-level destination |
| --- | --- |
| Antigravity (Gemini 3.1 Pro and Claude) | `~/.gemini/GEMINI.md` |
| Kiro (Claude) | `~/.kiro/steering/agents.md` |
| Claude Code, including third-party API configurations | `~/.claude/output-styles/onlytris.md` |

Claude Code additionally receives `"outputStyle": "OnlyTris"` in `~/.claude/settings.json`. Existing top-level settings are preserved. A new Claude Code session is required after synchronization because output styles are selected when a session starts.

## Installation

### Install a prebuilt VSIX

1. Download the `.vsix` file from the project release.
2. Open the Extensions view in VS Code or a compatible editor.
3. Choose **Install from VSIX...** from the overflow menu.
4. Reload the editor when prompted.

### Build from source

Requirements:

- Node.js 20 or newer
- npm

```bash
npm ci
npm run check
npm run compile
npm run package
```

## Usage

1. Open **Agent Safety Lab** from the activity bar.
2. Select a profile version.
3. Activate synchronization.
4. Start a new Claude Code session when testing the Claude target.
5. Use **Reset Bypass** to remove files owned by the extension and restore the previous Claude output style.

## Configuration ownership

The extension only owns its dedicated Claude style file, `output-styles/onlytris.md`. It does not create, overwrite, or delete the user's global `CLAUDE.md`. Reset only changes `settings.json` when the active style is still `OnlyTris`; a style selected manually after synchronization is left untouched.

## Privacy and network behavior

Activating synchronization downloads the selected profile from the URL embedded in the extension. The downloaded text is then written to the supported user-level configuration locations. Review the source and downloaded profile before using the extension in a sensitive environment.

## Development

```bash
npm install
npm run watch
```

Press `F5` in VS Code to launch an Extension Development Host.

## Responsible use

Only evaluate systems and accounts you own or have permission to test. Do not use this project to evade access controls, obtain unauthorized data, or misrepresent system capabilities. The full policy is provided in `RESPONSIBLE_USE.md`.

## Contributing

See `CONTRIBUTING.md` for the development workflow and `SECURITY.md` for reporting vulnerabilities.

## License

Released under the MIT License in `LICENSE`.
