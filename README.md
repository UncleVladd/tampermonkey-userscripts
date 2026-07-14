# Tampermonkey Userscripts

Personal Tampermonkey userscripts for adding small quality-of-life improvements to web applications.

## Scripts

### ChatGPT Library Select Current View

Adds **Select current view** and **Clear selection** buttons to the ChatGPT Library. The script selects only file checkboxes that are currently rendered on the page.

See the [ChatGPT scripts README](chatgpt/README.md) and the [script documentation](chatgpt/library-select-all/README.md).

## Installation

1. Install the [Tampermonkey browser extension](https://www.tampermonkey.net/).
2. Open the `.user.js` file for the script you want to install.
3. Install it through Tampermonkey, or copy the file contents into a new Tampermonkey script.
4. Open the relevant website and verify that the script is working.

Each script directory contains its own usage instructions and limitations.

## Important limitations

These scripts depend on the websites' current HTML structure and may stop working after a site update. Review any action before confirming it. The ChatGPT Library script does not delete files automatically and does not select files that have not loaded yet.

## Disclaimer

These are unofficial personal projects. They are not affiliated with or endorsed by the websites or their owners. Use them at your own risk.
