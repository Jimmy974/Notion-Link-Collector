// background.js

// Initialize context menus from stored settings
function initContextMenus() {
  chrome.storage.local.get(['databases','defaultDbId'], ({databases = [], defaultDbId}) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'root',
        title: 'Save to Notion',
        contexts: ['link']
      });
      databases.forEach(db => {
        chrome.contextMenus.create({
          id: db.id,
          parentId: 'root',
          title: (db.id === defaultDbId ? '✅ ' : '') + db.name,
          contexts: ['link']
        });
      });
    });
  });
}

// On install or startup, build menus
chrome.runtime.onInstalled.addListener(initContextMenus);
chrome.runtime.onStartup.addListener(initContextMenus);
// Update on settings change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.databases || changes.defaultDbId)) {
    initContextMenus();
  }
});

// Handle click events
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'root') return;
  const linkUrl = info.linkUrl;
  const dbId = info.menuItemId;
  chrome.storage.local.get(['token'], ({token}) => {
    if (!token) {
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Save to Notion',
        message: 'Missing Notion token. Please set it in options.'
      });
      return;
    }
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
    const body = JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [ { text: { content: linkUrl } } ] }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { type: 'text', text: { content: linkUrl, link: { url: linkUrl } } }
            ]
          }
        }
      ]
    });
    fetch('https://api.notion.com/v1/pages', { method: 'POST', headers, body })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(() => {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Save to Notion',
          message: 'Link saved successfully!'
        });
      })
      .catch(err => {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Save to Notion',
          message: 'Error saving link: ' + err.message
        });
      });
  });
});

// Listen for multi-link save requests from the content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action !== 'saveSelectedLinks') return;
  const links = message.links;
  chrome.storage.local.get(['token','defaultDbId'], ({token, defaultDbId: dbId}) => {
    if (!token || !dbId) {
      chrome.notifications.create('', { type: 'basic', iconUrl: 'icons/icon48.png', title: 'Save to Notion', message: 'Please select a default database in options page.' });
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
    links.forEach(link => {
      const body = JSON.stringify({
        parent: { database_id: dbId },
        properties: { Name: { title: [{ text: { content: link.href } }] } },
        children: [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: link.text || link.href, link: { url: link.href } } }] } }]
      });
      fetch('https://api.notion.com/v1/pages', { method: 'POST', headers, body })
        .catch(err => {
          chrome.notifications.create('', { type: 'basic', iconUrl: 'icons/icon48.png', title: 'Save to Notion', message: 'Error saving: ' + link.href });
        });
    });
    chrome.notifications.create('', { type: 'basic', iconUrl: 'icons/icon48.png', title: 'Save to Notion', message: `Saved ${links.length} links!` });
  });
});
