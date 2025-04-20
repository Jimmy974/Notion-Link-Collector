// Load and save settings in chrome.storage.local

const tokenInput = document.getElementById('token');
const dbList = document.getElementById('db-list');
const saveBtn = document.getElementById('save');
const fetchDbBtn = document.getElementById('fetch-dbs');

let settings = { token: '', databases: [], defaultDbId: '' };

function renderDbs() {
  dbList.innerHTML = '';
  settings.databases.forEach((db, idx) => {
    const div = document.createElement('div');
    div.className = 'db-entry';
    div.innerHTML = `
      <input type="radio" name="default-db" id="default-${idx}" value="${db.id}" ${db.id===settings.defaultDbId?'checked':''} />
      <label for="default-${idx}">${db.name} (${db.id})</label>
    `;
    dbList.appendChild(div);
  });
} 

function loadSettings() {
  chrome.storage.local.get(['token','databases','defaultDbId'], res => {
    settings.token = res.token || '';
    settings.databases = res.databases || [];
    settings.defaultDbId = res.defaultDbId || '';
    tokenInput.value = settings.token;
    renderDbs();
  });
} 

function saveSettings() {
  settings.token = tokenInput.value;
  const sel = document.querySelector('input[name="default-db"]:checked');
  settings.defaultDbId = sel? sel.value : '';
  chrome.storage.local.set(settings, () => {
    alert('Settings saved');
  });
}

function fetchDatabases() {
  const token = tokenInput.value;
  if (!token) { alert('Please enter Notion Integration Token'); return; }
  fetchDbBtn.disabled = true;
  fetchDbBtn.textContent = 'Fetching...';
  fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: "", filter: { property: 'object', value: 'database' } })
  })
    .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
    .then(data => {
      settings.databases = data.results.map(item => ({ id: item.id, name: (item.title?.[0]?.plain_text) || 'Untitled' }));
      renderDbs();
      // Persist fetched databases and default selection
      chrome.storage.local.set({ token: token, databases: settings.databases, defaultDbId: settings.defaultDbId });
    })
    .catch(err => { alert('Error fetching databases: ' + err.message); })
    .finally(() => {
      fetchDbBtn.disabled = false;
      fetchDbBtn.textContent = 'Fetch Databases';
    });
}

// Removed manual DB entry logic

fetchDbBtn.addEventListener('click', fetchDatabases);
saveBtn.addEventListener('click', saveSettings);
window.addEventListener('DOMContentLoaded', loadSettings);
