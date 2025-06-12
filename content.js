// content.js

const selectedLinks = new Set();
let copyBtn;
let notebookBtn;

function createButtons() {
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
  
  // Create NotebookLM save button
  notebookBtn = document.createElement('button');
  notebookBtn.id = 'notion-saver-notebook-btn';
  notebookBtn.textContent = 'Save + NotebookLM';
  Object.assign(notebookBtn.style, {
    position: 'fixed',
    bottom: '120px',
    right: '20px',
    zIndex: '10000',
    padding: '8px 12px',
    background: '#673AB7',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'none'
  });
  notebookBtn.addEventListener('click', saveSelectedWithNotebookTitle);
  document.body.appendChild(notebookBtn);
}

function updateButtons() {
  if (!copyBtn || !notebookBtn) createButtons();
  const display = selectedLinks.size > 0 ? 'block' : 'none';
  copyBtn.style.display = display;
  notebookBtn.style.display = display;
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

// Save selected links and ask for notebook title
function saveSelectedWithNotebookTitle() {
  if (selectedLinks.size === 0) return;
  const notebookTitle = prompt('Enter NotebookLM title for selected links:');
  if (!notebookTitle) return;
  const linksArray = Array.from(selectedLinks).map(href => {
    const a = document.querySelector(`a[href="${href}"]`);
    return { href, text: a?.innerText || href };
  });
  chrome.runtime.sendMessage({ action: 'saveSelectedLinksNotebookLM', links: linksArray, notebookTitle });
}

// Initialize content script
// CSS loaded via content.css
createButtons();
document.addEventListener('click', handleLinkClick);
