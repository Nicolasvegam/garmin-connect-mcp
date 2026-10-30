# Changelog

## 1.2.0

Changes since the published npm release 1.1.1 (2026-02-15).

### Fixed

- The npm package exposes `garmin-connect-mcp-setup` (`build/setup.js`, shebang, executable) in addition to `garmin-connect-mcp`.
- `npx @nicolasvegam/garmin-connect-mcp setup` runs the interactive setup flow and prompts for the MFA code. Previously that argument was ignored and the MCP server started on stdio.
- Email and SMS MFA pages titled "GARMIN Authentication Application" are recognized as a challenge. When Garmin has not already sent a code, setup requests one before asking for it.
- `get_steps` returns the steps chart instead of the full daily summary.
- Authentication refresh stops after 2 failed attempts instead of retrying without a limit.
- Garmin Connect API requests time out after 30 seconds.

### Added

- Interactive MFA setup that saves OAuth tokens under `~/.garmin-mcp/`.
- `YYYY-MM-DD` validation and numeric bounds on tool inputs.
- Token files written with mode `0600` and the token directory with mode `0700`.
- `npm test` / `npm run typecheck`, and GitHub Actions CI on pull requests and pushes to `main`.
- Date-range fetches keep going when one day fails and record that day's error.

## 1.1.1

Published to npm on 2026-02-15. Not tagged in this repository. The package only shipped the `garmin-connect-mcp` binary.
