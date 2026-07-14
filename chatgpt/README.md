# ChatGPT Userscripts

Tampermonkey userscripts for small workflow improvements in ChatGPT.

## Current scripts

### Library Select Current View

[`library-select-all`](library-select-all/) adds two controls to the ChatGPT Library:

- **Select current view** selects file checkboxes currently rendered on the page.
- **Clear selection** deselects those file checkboxes.

The script does not delete files. Deletion remains a manual action through ChatGPT's native controls.

Read the [script README](library-select-all/README.md) for installation and usage instructions.

## Adding a script

Create a directory for the script, include a `.user.js` file with complete Tampermonkey metadata, and add a README describing installation, usage, and limitations. Link the new script from this README and the repository root README.
