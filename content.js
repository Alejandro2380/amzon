// DOM OBSERVATION

let lastUrl = location.href; // Initialize last URL
// Check if the page is already loaded, or wait for it to load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeScript(); // Initialize immediately if the page is already loaded
}

document.addEventListener('DOMContentLoaded', initializeScript);


function initializeScript() {
    try{
        if (!chrome.runtime || !chrome.runtime.id) {
        throw new Error("Chrome extension context is not valid. Check manifest.json and permissions.");
    }

    console.log("Initializing script in a valid extension context...");

    attachAddToCartListener();
    processStoredProductDetails(); // Process details after navigation

    observeDomChanges(); // Observe dynamic DOM updates
    hideBuyButtonsForBlockedItems();
} catch (error) {
    console.error("Error during script initialization:", error);
}
}
// Attach click listener for "Add to Cart" button
function attachAddToCartListener() {
    document.body.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'add-to-cart-button') {
            const productName = document.querySelector('#productTitle')?.innerText.trim() || "Unknown Product Name";
            const productId = document.querySelector('[data-asin]')?.getAttribute('data-asin') || "Unknown Product ID";


            console.log("Detected Add to Cart Click:", { productId, productName });

            if (productId && productName) {
                console.log("Adding Product to Blocked Items:", { productId, productName });
                chrome.storage.local.set({ lastProduct: { productId, productName } });

                blockItem(productId, productName); // Save product to blocked items
            } else {
                console.error("Failed to capture product details.");
            }
        }
    });
}

function observeDomChanges() {
    // if (observer) observer.disconnect();
    const observer = new MutationObserver(() => {
        const currentUrl = location.href;

        if (currentUrl !== lastUrl) {
            console.log("URL changed. Reinitializing script...");
            lastUrl = currentUrl;
            initializeScript();
        }
        });
    observer.observe(document.body, { childList: true, subtree: true });
    }


 // HIDE BUTTON FOR BLOCKED OUT ITEMS
 function hideBuyButtonsForBlockedItems() {
    chrome.storage.local.get(['blockedItems'], (data) => {
        const blockedItems = data.blockedItems || {};
        const now = Date.now();

        for (const productId in blockedItems) {
            const productInfo = blockedItems[productId];
            if (productInfo.expirationTime > now) {
                const buyNowButton = document.querySelector('#buy-now-button');
                if (buyNowButton) {
                    buyNowButton.style.display = 'none';
                    console.log(`Buy button hidden for product: ${productInfo.productName}`);
                }
            }
        }
    });
};
// Add item to blocked list
function blockItem(productId, productName) {
    chrome.storage.local.get(['blockedItems'], (data) => {
        const blockedItems = data.blockedItems || {};
        const expirationTime = Date.now() + 3 * 24 * 60 * 60 * 1000; // Block for 3 days

        if (!blockedItems[productId]) {
            blockedItems[productId] = { productName, expirationTime };
            chrome.storage.local.set({ blockedItems }, () => {
                console.log(`Blocked item "${productName}" for 3 days.`);
            });
        } else {
            console.log(`Item "${productName}" is already blocked.`);
        }
    });
}


function processStoredProductDetails() {
    chrome.storage.local.get('lastProduct', (data) => {
        const lastProduct = data.lastProduct;
        if (lastProduct) {
            console.log("Retrieved Last Product:", lastProduct);
            blockItem(lastProduct.productId, lastProduct.productName);
            // Clear stored details after processing
            chrome.storage.local.remove('lastProduct');
        } else {
            console.error("No product details found after navigation.");
        }
    });
}
// Start monitoring navigation and initialize the script
initializeScript();




