
document.addEventListener('DOMContentLoaded', () => {
    // Fetch blocked items from storage
    chrome.storage.local.get('blockedItems', (data) => {
        
        console.log("Blocked Items Retrieved (formatted):", JSON.stringify(data.blockedItems, null, 2));
        
        const blockedItems = data.blockedItems || {};
        const now = Date.now(); 
        const productList = document.getElementById('product-list');

        // Ensure the product list element exists
        if (!productList) {
            console.warn("Product list element not found.");
            return; // Stop execution if the element is missing
        }

        // Clear or update the product list
     // If no items are blocked, display a message
     if (Object.keys(blockedItems).length === 0) {
        productList.innerHTML = '<p>No delayed products currently.</p>';
        return;
    }
    productList.innerHTML = ''; // Clear any existing content

        let hasChanges = false;

        for (const productId in blockedItems) {
            if (blockedItems[productId].expirationTime <= now) {
                delete blockedItems[productId];
                hasChanges = true;
            }
        }
                // Update storage if expired items were removed
                if (hasChanges) {
                    chrome.storage.local.set({ blockedItems }, () => {
                        console.log("Expired blocked items removed.");

                    });
                }
                if (!data.blockedItems || Object.keys(data.blockedItems).length === 0) {
                    productList.innerHTML = '<p>No delayed products currently.</p>';
                    return;
                }
            
          // Populate the product list with blocked items
          productList.innerHTML = ''; // Clear any existing content
          for (const [productId, item] of Object.entries(blockedItems)) {
              const productDiv = document.createElement('div');
              productDiv.className = 'product';
              productDiv.innerHTML = `
                  <p><strong>${item.productName}</strong></p>
                  <p>Blocked for 3 days.</p>
              `;
              productList.appendChild(productDiv);
          }
      });
    
    // Helper function to format time remaining
    function formatTimeRemaining(ms) {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}d ${hours}h ${minutes}m`;
    }
    
});
    // Add event listener for the "Clear" button
    const clearButton = document.getElementById('clear-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            chrome.storage.local.set({ blockedItems: {} }, () => {
                const productList = document.getElementById('product-list');
                if (productList) {
                    productList.innerHTML = '<p>No delayed products currently.</p>';
                } else {
                    console.warn("Product list element not found during clear.");
                }
            });
        });
    } else {
        console.warn("Clear button not found.");
    }


// const logButton = document.getElementById('log-Button'); // Locate the button in the DOM

// logButton.addEventListener('click', () => {
//     chrome.tabs.create({ url: chrome.runtime.getURL('log.html') });
// });

// log.js


