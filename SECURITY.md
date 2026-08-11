# Security Policy

## Supported versions

Security fixes are applied to the latest release.

## Reporting a vulnerability

Please use the repository's private security-advisory feature when available. Do not publish exploit details, credentials, tokens, private prompts, or sensitive local paths in a public issue.

Include:

- A concise description of the issue.
- Affected version and operating system.
- Reproduction steps using non-sensitive test data.
- Expected and observed behavior.
- Suggested mitigation, if known.

## Security boundaries

The extension writes user-level configuration files and downloads instruction profiles from an embedded remote endpoint. Treat profile content as untrusted input, review changes before distribution, and use the extension only in environments where you are authorized to modify agent configuration.
