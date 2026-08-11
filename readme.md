# Agent Safety Jailbreak Lab

Agent Safety Jailbreak Lab is a VS Code-compatible extension for cross-model instruction and guardrail evaluation. It synchronizes a selected research profile to supported AI coding environments from one sidebar.

Extension identifier: `onlytrisdev.agent-safety-jailbreak-lab`.

> [!IMPORTANT]
> This project is intended for authorized research, prompt-behavior evaluation, and local experimentation. It does not disable provider-enforced safeguards, access controls, or platform policies.

## Features

- Synchronizes research profiles across supported AI coding assistants.
- Provides one-click activation and reset controls.
- Includes two profile variants for comparative testing.
- Supports Windows, macOS, and Linux.
- Displays file size, line count, and last synchronization time.

## Supported environments

- **Antigravity:** Gemini 3.1 Pro and Claude.
- **Kiro:** Claude.
- **Claude Code:** including installations configured to use compatible third-party API providers.

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
4. Restart the target assistant when necessary, then begin your evaluation.
5. Use **Reset Bypass** to remove the active profile.

## Privacy and network behavior

Activating synchronization downloads the selected profile from the project-maintained endpoint. Review the source and profile content before using the extension in a sensitive environment.

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
