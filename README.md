# Notion Link Collector

A lightweight Chrome extension to quickly save links from any web page into your Notion database.

## Introduction
Notion Link Collector helps you organize and store links seamlessly:
- **Single-Link Save**: Right-click any link and choose your Notion database.
- **Multi-Link Save**: Ctrl/Cmd+click multiple links to select, then click the floating button to batch-save.

## Features
- Context-menu integration for one-click saves.
- In-page multi-select with visual highlights.
- Options page to configure your Notion Integration token and default database.
- Desktop notifications for success/error feedback.

## Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `my-notion-saver/` folder.

## Configuration
1. Click **Details** under the extension and then **Extension options**.
2. Enter your Notion Integration Token.
3. Click **Fetch Databases** to load your available Notion databases.
4. Select a default database and click **Save**.

## Usage
### Single-Link Save
1. Browse any web page.  
2. Right-click a link → **Save to Notion** → choose your database.  
3. You'll see a desktop notification on success.

### Multi-Link Save
1. Hold **Ctrl** (Windows/Linux) or **⌘** (Mac) and click each link to select.  
2. Selected links are highlighted.  
3. Click the **Save Selected Links** button at bottom-right.  
4. Links are batch-saved to your default database with a summary notification.

## Development
- **manifest.json**: Extension configuration (Manifest V3).  
- **background.js**: Context-menu and Notion API handler.  
- **content.js & content.css**: In-page selection logic and styling.  
- **popup.html & popup.js**: Legacy multi-link popup (optional, can disable when using in-page select).  
- **options.html & options.js**: Settings UI for token and default DB.

## Customization
- Adjust selection key (e.g. Shift-click) in `content.js`.  
- Modify styling in `content.css`.  
- Add summary extraction or LLM summarization in `background.js` or `content.js`.

## License
MIT © Your Name
