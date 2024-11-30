
  // Add logic to open log.html
  document.addEventListener('DOMContentLoaded', () => {
      const logButton = document.getElementById('log-button');
      if (logButton) {
          logButton.addEventListener('click', () => {
              chrome.tabs.create({ url: chrome.runtime.getURL('log.html') });
          });
      } else {
          console.warn("Log button not found in popup.html.");
      }
  });
