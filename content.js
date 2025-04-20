// content.js

const selectedLinks = new Set();
let saveBtn;

function createSaveButton() {
  saveBtn = document.createElement('button');
  saveBtn.id = 'notion-saver-save-btn';
  saveBtn.textContent = 'Save Selected Links';
  Object.assign(saveBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '10000',
    padding: '8px 12px',
    background: '#212121',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'none'
  });
  saveBtn.addEventListener('click', saveSelected);
  document.body.appendChild(saveBtn);
}

function updateSaveButton() {
  if (!saveBtn) createSaveButton();
  saveBtn.style.display = selectedLinks.size > 0 ? 'block' : 'none';
}

function handleLinkClick(e) {
  const a = e.target.closest('a');
  if (!a) return;
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  const href = a.href;
  if (selectedLinks.has(href)) {
    selectedLinks.delete(href);
    a.classList.remove('notion-saver-selected');
  } else {
    selectedLinks.add(href);
    a.classList.add('notion-saver-selected');
  }
  updateSaveButton();
}

function saveSelected() {
  if (selectedLinks.size === 0) return;
  const linksArray = Array.from(selectedLinks).map(href => {
    const a = document.querySelector(`a[href="${href}"]`);
    return { href, text: a?.innerText || href };
  });
  chrome.runtime.sendMessage({ action: 'saveSelectedLinks', links: linksArray });
}

// Initialize content script
// CSS loaded via content.css
createSaveButton();
document.addEventListener('click', handleLinkClick);
