// popup.js

// Utility to get storage with Promises
/**
 * Wrap chrome.storage.local.get in a Promise.
 * @param {string|string[]} keys
 * @returns {Promise<Object>}
 */
function getStorage(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

let links = [];

function renderLinks(items) {
  const list = document.getElementById('links-list');
  list.innerHTML = '';
  items.forEach((link, idx) => {
    const div = document.createElement('div');
    div.className = 'link-entry';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.idx = idx;
    const label = document.createElement('label');
    label.textContent = (link.text || link.href).slice(0, 50) + (link.href.length > 50 ? '...' : '');
    div.appendChild(cb);
    div.appendChild(label);
    list.appendChild(div);
  });
}

async function refreshLinks() {
  const [tab] = await new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, resolve));
  if (!tab?.id) return;
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText }))
  });
  links = results[0]?.result || [];
  renderLinks(links);
}

async function saveSelected() {
  const selected = Array.from(document.querySelectorAll('.link-entry input:checked')).map(cb => links[cb.dataset.idx]);
  if (!selected.length) { alert('No links selected'); return; }
  const storage = await getStorage(['token', 'lastUsedDbId']);
  const token = storage.token;
  const dbId = storage.lastUsedDbId;
  if (!token) { alert('Missing Notion token'); return; }
  if (!dbId) { alert('No database selected yet'); return; }
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };
  for (const link of selected) {
    const body = JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [ { text: { content: link.href } } ] }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { type: 'text', text: { content: link.text || link.href, link: { url: link.href } } }
            ]
          }
        }
      ]
    });
    try {
      const res = await fetch('https://api.notion.com/v1/pages', { method: 'POST', headers, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      chrome.notifications.create('', { type: 'basic', iconUrl: 'icons/icon48.png', title: 'Save to Notion', message: 'Error saving: ' + (link.href) });
    }
  }
  chrome.notifications.create('', { type: 'basic', iconUrl: 'icons/icon48.png', title: 'Save to Notion', message: `Saved ${selected.length} links!` });
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refresh').addEventListener('click', refreshLinks);
  document.getElementById('save-selected').addEventListener('click', saveSelected);
  refreshLinks();
});
