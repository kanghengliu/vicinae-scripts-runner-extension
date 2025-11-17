# Script Shortcuts for Vicinae

Launch your favorite shell snippets from Vicinae. Use the catalog command for discovery, or jump straight into a saved script with a dedicated no-view command.

## Roadmap
- [x] Run scripts by searching at vicinae
- [x] Control Catalogue to view available scripts
- [ ] Add standalone commands to control catalogue (Ex. Rename workspace is not a script thus can't be indexed in control catalogue)

## Configure Scripts

All definitions live in `src/scripts.ts`:

- `id`: unique key for the list UI.
- `commandName`: command `name` from `package.json`.
- `title`: human-friendly label.
- `commandLine`: shell string (runs with `shell: true`, so pipes and aliases are fine).
- Optional `description`, `keywords`, `icon`, `workingDirectory`, `env`, `timeoutMs`, `hiddenFromList`.

Add a new script by duplicating the sample entry and updating these fields.

## Top-Level Commands

For every script you want at the root search level:

1. Duplicate `src/sample-script.ts`, rename the copy to match the `commandName` (for example `src/bzmenu.ts`).
2. Update `package.json` → `commands` with a new entry:
   - `name`: must match the file name and `commandName` in `src/scripts.ts`.
   - `mode`: use `"no-view"` for one-click execution.

The shared runner uses `environment.commandName` to look up the right script definition, so no other wiring is required.

## Commands Included

- `controls` (view): browsable catalog with search and run actions.
- `rename-workspace` (view): text prompt that renames the active Hyprland workspace and shows the OSD.
- `sample-script` (no-view): placeholder entry; replace or remove once you add real scripts.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

> `npm run build` invokes `vici build`, so ensure the Vicinae desktop app is running beforehand.
