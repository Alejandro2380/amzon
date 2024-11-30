
document.addEventListener('DOMContentLoaded', () => {
    // Fetch blocked items from storage
    chrome.storage.local.get('blockedItems', (data) => {
        
        console.log("Blocked Items Retrieved (formatted):", JSON.stringify(data.blockedItems, null, 2));
        
        const blockedItems = data.blockedItems || {};
        const now = Date.now(); 
        const productList = document.getElementById('product-list');

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
                    });
                }
                if (!data.blockedItems || Object.keys(data.blockedItems).length === 0) {
                    productList.innerHTML = '<p>No delayed products currently.</p>';
                    return;
                }
            
                productList.innerHTML =''; 

                
        for (const [productId, item] of Object.entries(blockedItems)) {
            const timeRemaining = Math.max(0, item.expirationTime - now);
            if (timeRemaining <= 0) continue; // Skip expired products

          
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <p><strong>${item.productName}</strong></p>
                <p>Time Remaining: ${formatTimeRemaining(timeRemaining)}</p>
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
document.getElementById('clear-button').addEventListener('click', () => {
    chrome.storage.local.set({ blockedItems: {} }, () => {
        document.getElementById('product-list').innerHTML = '';
    });
});

// const logButton = document.getElementById('log-Button'); // Locate the button in the DOM

// logButton.addEventListener('click', () => {
//     chrome.tabs.create({ url: chrome.runtime.getURL('log.html') });
// });

// log.js

    const logButton = document.getElementById('log-button');
    if (logButton) {
        logButton.addEventListener('click', () => {
            console.log('Log button clicked!');
            chrome.tabs.create({ url: chrome.runtime.getURL('log.html') });

            // Perform desired action
        });
    } else {
        console.error('Log button not found in popup.html.');
    }

