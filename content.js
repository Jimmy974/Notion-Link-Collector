// content.js

const selectedLinks = new Set();
let saveBtn;
let copyBtn;

function createButtons() {
  // Create save button
  saveBtn = document.createElement('button');
  saveBtn.id = 'notion-saver-save-btn';
  saveBtn.textContent = 'Save Selected Links';
  Object.assign(saveBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '120px',
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
  
  // Create copy button
  copyBtn = document.createElement('button');
  copyBtn.id = 'notion-saver-copy-btn';
  copyBtn.textContent = 'Copy Selected Links';
  Object.assign(copyBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '10000',
    padding: '8px 12px',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'none'
  });
  copyBtn.addEventListener('click', copySelectedToClipboard);
  document.body.appendChild(copyBtn);
}

function updateButtons() {
  if (!saveBtn || !copyBtn) createButtons();
  const display = selectedLinks.size > 0 ? 'block' : 'none';
  saveBtn.style.display = display;
  copyBtn.style.display = display;
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
  updateButtons();
}

function saveSelected() {
  if (selectedLinks.size === 0) return;
  const linksArray = Array.from(selectedLinks).map(href => {
    const a = document.querySelector(`a[href="${href}"]`);
    return { href, text: a?.innerText || href };
  });
  chrome.runtime.sendMessage({ action: 'saveSelectedLinks', links: linksArray });
}

// Copy selected links to clipboard
function copySelectedToClipboard() {
  if (selectedLinks.size === 0) return;
  const text = Array.from(selectedLinks).join('\n');
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log(`Copied ${selectedLinks.size} links to clipboard`);
      // Show temporary notification
      const notification = document.createElement('div');
      notification.textContent = `${selectedLinks.size} links copied to clipboard!`;
      Object.assign(notification.style, {
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        padding: '8px 12px',
        background: '#4CAF50',
        color: '#fff',
        borderRadius: '4px',
        zIndex: '10001',
        transition: 'opacity 0.3s'
      });
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    })
    .catch(err => {
      console.error('Error copying links: ', err);
      alert('Failed to copy links to clipboard: ' + err.message);
    });
}

// Initialize content script
// CSS loaded via content.css
createButtons();
document.addEventListener('click', handleLinkClick);
